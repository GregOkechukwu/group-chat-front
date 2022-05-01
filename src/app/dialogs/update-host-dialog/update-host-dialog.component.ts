import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData, ChatUser } from 'src/app/interfaces';
import { MatSelectionList, MatListOption, MatSelectionListChange } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-update-host-dialog',
  templateUrl: './update-host-dialog.component.html',
  styleUrls: ['./update-host-dialog.component.css']
})
export class UpdateHostDialogComponent implements OnInit {

  @ViewChild('selectionList') selectionList : MatSelectionList;

  chatUsers : ChatUser[];
  currentSelectedUser : string;
  currentUsername : string;

  constructor(
    private dialogRef : MatDialogRef<UpdateHostDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data : DialogData
  ) { }

  ngOnInit() {
    const multiple = false;
    this.selectionList.selectedOptions = new SelectionModel<MatListOption>(multiple);
    this.chatUsers = this.data.content.chatUsers;
    this.currentUsername = this.data.content.currentUsername;
  }

  confirm() {
    this.dialogRef.close({
      choseToUpdate : true,
      newHostId : this.currentSelectedUser
    });
  }

  onSelectionChange(selectionListChange : MatSelectionListChange) {
    this.currentSelectedUser = selectionListChange.option.value;
  }

  close() {
    this.dialogRef.close({
      choseToUpdate : false,
      newHostId : ""
    });
  }

}
