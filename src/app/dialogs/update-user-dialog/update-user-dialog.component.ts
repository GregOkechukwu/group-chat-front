import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { UserInfoService } from 'src/app/services/user-info.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DialogData } from 'src/app/interfaces';
import { Subscription } from 'rxjs/internal/Subscription';


@Component({
  selector: 'app-update-user-dialog',
  templateUrl: './update-user-dialog.component.html',
  styleUrls: ['./update-user-dialog.component.css']
})
export class UpdateUserDialogComponent implements OnInit {

  subscriptions : Subscription[] = [];
  
  form : {
    passwordForm : FormGroup
  }

  constructor(
    private userInfoService : UserInfoService,
    private dialogRef: MatDialogRef<UpdateUserDialogComponent>,
    private formBuilder : FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data : DialogData
  ) { }

  ngOnInit() {
    const passwordForm = this.formBuilder.group({
      password : ['', Validators.required]
    });

    this.form = {
      passwordForm
    };
  }
  
  confirm() {
    if (!this.form.passwordForm.valid) {
      return;
    }
    
    this.userInfoService.checkPassword(this.password).subscribe(() => {
      this.dialogRef.close({
        choseToUpdate : true,
        password : this.password
      });
    }, (err : HttpErrorResponse) => {
      if (!err.ok) {
        this.passwordControl.setErrors({invalidPassword : true});
      }
    });
  }

  close() {
    this.dialogRef.close({
      choseToUpdate : false,
      password : ""
    });
  }

  disableForm() {
    this.form.passwordForm.disable();
  }

  enableForm() {
    this.form.passwordForm.enable();
  }

  getErrorMessage(control : AbstractControl) {
    return control.hasError("invalidPassword") ? "Invalid Password" : "";
  }

  get passwordControl() {
    return this.form.passwordForm.controls.password;
  }

  get password() {
    return this.form.passwordForm.controls.password.value;
  }

}
