import { Injectable } from '@angular/core';
import { environment } from  '../../environments/environment';

export var root = environment.ROOT;

class Trie {
    private root : Object = {};

    constructor() { }

    addWord(word : string) {
        let curr : Object;
        let n = word.length;

        curr = this.root;

        for (let i = 0; i < n + 1; i++) {
            if (i === n) {
                curr['*'] = true;
                continue;
            }

            let char = word[i]

            if (!curr[char]) {
                curr[char] = {};
            }

            curr = curr[char];
        }

        return this.root;
    }

    foundWord(word : string) {
        let curr = this.root, i = 0;

        while (i < word.length && curr[word[i]]) {
            curr = curr[word[i]];
            i++;
        }
        return curr['*'] ? true : false;
    }
}

@Injectable({
    providedIn :  'root'
})
export class RouteService {
    blackListTrie = new Trie();

    constructor() { }
}