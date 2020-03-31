import { Injectable } from '@angular/core';
import { HttpResponse, HttpRequest } from '@angular/common/http';
import { ResponseCacheEntry } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class CacheService  {
  private responseMap : Map<string, ResponseCacheEntry> = new Map<string, ResponseCacheEntry>();
  private imageMap : Map<string, string | Object> = new Map<string, string | Object>();
  private TTL : number = this.toSeconds(30000);

  constructor() { }

  getResponse(req : HttpRequest<any>) : HttpResponse<any> {
    const url = req.urlWithParams;

    if (!this.responseMap.has(url)) {
      return undefined;
    }

    const entry = this.responseMap.get(url);
    const now = this.toSeconds(Date.now());

    if (this.isExpired(now, entry.lastRead)) {
      entry.lastRead = now;
    }

    console.log(entry);
    return entry.response;
  }

  putResponse(req : HttpRequest<any>, res : HttpResponse<any>) {
    const url = req.urlWithParams
    const now = this.toSeconds(Date.now());
    const entry : ResponseCacheEntry = {lastRead : now, response : res};

    this.responseMap.forEach((entry, url) => {
      if (this.isExpired(now, entry.lastRead)) this.responseMap.delete(url);
    });

    if (!this.isCacheable(req, res)) {
      return;
    }

    this.responseMap.set(url, entry);
  }

  getImage(key : string) {
    return this.hasImage(key) ? this.imageMap.get(key) : undefined;
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

  /* Will update this. No Requests are cachable at the moment */
  private isCacheable(req : HttpRequest<any>, res : HttpResponse<any>) {
    return req.method === 'GET' && res.body && res.body.cacheable === true;
  }

  private toSeconds(ms : number) {
    return ms / 1000;
  }

}
