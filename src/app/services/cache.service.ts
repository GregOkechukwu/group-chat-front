import { Injectable } from '@angular/core';
import { HttpResponse, HttpRequest } from '@angular/common/http';

interface ResponseCacheEntry {
  lastRead : number;
  response : HttpResponse<any>;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService  {
  responseMap = new Map<string, ResponseCacheEntry>();
  imageMap = new Map<string, string | Object>();
  TTL = this.toSeconds(30000);

  constructor() { }

  getResponse(req : HttpRequest<any>) : HttpResponse<any> {
    const url = req.urlWithParams;

    if (!this.responseMap.has(url)) {
      return undefined;
    }
    let entry = this.responseMap.get(url);
    let now = this.toSeconds(Date.now());

    if (this.isExpired(now, entry.lastRead)) {
      entry.lastRead = now;
    }
    return entry.response;
  }

  putResponse(req : HttpRequest<any>, res : HttpResponse<any>) {
    const url = req.urlWithParams, now = this.toSeconds(Date.now());
    const entry : ResponseCacheEntry = {lastRead : now, response : res}

    this.responseMap.forEach((entry, url) => {
      if (this.isExpired(now, entry.lastRead)) this.responseMap.delete(url);
    });

    if (!this.isCacheable(req, res)) {
      return;
    }

    this.responseMap.set(url, entry);
  }

  getImage(key : string) {
    return this.hasImage(key) ? this.imageMap.get(key) : undefined
  }

  putImage(key : string, value : string | Object) {
    this.imageMap.set(key, value);
  }

  hasImage(key : string) {
    return this.imageMap.has(key);
  }

  deleteImage(key : string) {
    this.imageMap.delete(key);
  }

  clearCache() {
    this.clearResponseCache();
    this.clearImageCache();
  }

  clearResponseCache() {
    this.responseMap.clear();
  }
  clearImageCache() {
    this.imageMap.clear();
  }

  private isExpired(now : number, lastRead : number) {
    return (now - lastRead) > this.TTL;
  }

  private isCacheable(req : HttpRequest<any>, res : HttpResponse<any>) {
    return req.method === 'GET' && res.body.cacheable === true;
  }

  private toSeconds(ms : number) {
    return ms / 1000;
  }

}
