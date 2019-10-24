import { Injectable, QueryList, ElementRef } from '@angular/core';
import { HttpClient } from  '@angular/common/http';
import { UserInfoService } from './user-info.service';

@Injectable({
  providedIn :  'root'
})
export class FormValidatorService {

  constructor(private http : HttpClient, private userInfoService : UserInfoService) { }

  checkEmailStr(str) : boolean {
    return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(str))
  }

  checkForPasswordMatch(pass1, pass2) : boolean {
    return pass1 === pass2;
  }

  trim(str) {
    return str.replace(/^\s+|\s+$/g,"");
  }

  strLengthIsValid(str) {
    const trimmedStr = this.trim(str);
    return trimmedStr.length > 2;
  }

  checkForEmptyInputs(queryList : QueryList<ElementRef>, elem? : ElementRef<any> | string) {
    let emptyFields = false, errStr, str

    if (queryList) {
      queryList.forEach(input => { 
        str = input.nativeElement.value;
        if (!str || this.trim(str) === "") {
          emptyFields = true;
          errStr = "Empty Fields";
        }
      });
    } else if (elem || elem === '') {
      if (elem instanceof ElementRef) {
        str = elem.nativeElement.value;
      } else if ((typeof elem) === 'string') {
        str = elem;
      }
      if (!str || this.trim(str) === "") {
        emptyFields = true;
        errStr = "Empty Field";
      }
    }
    return {emptyFields, errStr}
  }
}


