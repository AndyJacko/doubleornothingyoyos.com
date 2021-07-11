import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Post } from './post.model';
import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiURL + '/posts/';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[]; totalPosts: number }>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(pageSize: number, currentPage: number) {
    const queryParams = `?pagesize=${pageSize}&page=${currentPage}`;
    this.http
      .get<{ message: string; posts: any; totalPosts: number }>(
        BACKEND_URL + queryParams
      )
      .pipe(
        map((postData) => {
          return {
            posts: postData.posts.map((post) => {
              return {
                ...post,
                id: post._id,
              };
            }),
            totalPosts: postData.totalPosts,
          };
        })
      )
      .subscribe((postList) => {
        this.posts = postList.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          totalPosts: postList.totalPosts,
        });
      });
  }

  getPost(id: string) {
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      postType: string;
      imageURL: string;
      videoURL: string;
      creator: string;
    }>(BACKEND_URL + id);
  }

  getPostUpdateListner() {
    return this.postsUpdated.asObservable();
  }

  addPost(
    title: string,
    content: string,
    postType: string,
    imageURL: File,
    videoURL: string
  ) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('postType', postType);
    postData.append('imageURL', imageURL, title);
    postData.append('videoURL', videoURL);

    this.http
      .post<{ message: string; post: Post }>(BACKEND_URL, postData)
      .subscribe((responseData) => {
        this.router.navigate(['/']);
      });
  }

  updatePost(
    id: string,
    title: string,
    content: string,
    postType: string,
    imageURL: File | string,
    videoURL: string
  ) {
    let postData: Post | FormData;
    if (typeof imageURL === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('postType', postType);
      postData.append('imageURL', imageURL, title);
      postData.append('videoURL', videoURL);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        postType: postType,
        imageURL: imageURL,
        videoURL: videoURL,
        creator: null,
      };
    }

    this.http.put(BACKEND_URL + id, postData).subscribe((response) => {
      this.router.navigate(['/']);
    });
  }

  deletePost(id: string) {
    return this.http.delete(BACKEND_URL + id);
  }
}
