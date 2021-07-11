import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthService } from 'src/app/auth/auth.service';
import { mimeType } from './mime-type.validator';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent implements OnInit, OnDestroy {
  private mode = 'create';
  private id: string;
  private authStatusSub: Subscription;
  post: Post;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;

  constructor(
    private postsService: PostsService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authStatusSub = this.authService
      .getAuthStatusListner()
      .subscribe((authStatus) => {
        this.isLoading = false;
      });
    this.form = new FormGroup({
      postType: new FormControl('Text'),
      title: new FormControl(null, {
        validators: [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(30),
        ],
      }),
      content: new FormControl(null, {
        validators: [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(2000),
        ],
      }),
      imageURL: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType],
      }),
      videoURL: new FormControl(''),
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('id')) {
        this.mode = 'edit';
        this.id = paramMap.get('id');
        this.isLoading = true;
        this.postsService.getPost(this.id).subscribe((postData) => {
          this.isLoading = false;
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            postType: postData.postType,
            imageURL: postData.imageURL,
            videoURL: postData.videoURL,
            creator: postData.creator,
          };

          this.form.setValue({
            postType: this.post.postType,
            title: this.post.title,
            content: this.post.content,
            imageURL: this.post.imageURL,
            videoURL: this.post.videoURL,
          });
        });
      } else {
        this.mode = 'create';
        this.id = null;
      }
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ imageURL: file });
    this.form.get('imageURL').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      this.postsService.addPost(
        this.form.value.title,
        this.form.value.content,
        this.form.value.postType,
        this.form.value.imageURL,
        this.form.value.videoURL
      );
    } else {
      this.postsService.updatePost(
        this.id,
        this.form.value.title,
        this.form.value.content,
        this.form.value.postType,
        this.form.value.imageURL,
        this.form.value.videoURL
      );
    }
    this.form.reset();
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
