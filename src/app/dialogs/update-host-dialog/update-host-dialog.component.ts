import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData, ChatUser } from 'src/app/interfaces';
import { MatSelectionList } from '@angular/material';

@Component({
  selector: 'app-update-host-dialog',
  templateUrl: './update-host-dialog.component.html',
  styleUrls: ['./update-host-dialog.component.css']
})
export class UpdateHostDialogComponent implements OnInit {

  @ViewChild('selectionList') selectionList : MatSelectionList;
  chatUsers : ChatUser[];

  constructor(
    private dialogRef : MatDialogRef<UpdateHostDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data : DialogData
  ) { }

  ngOnInit() {
    this.chatUsers = this.data.content;
  }

  confirm() {
    console.log(this.selectionList.selectedOptions);
    // this.dialogRef.close({
    //   choseToUpdate : true,
    //   newHostId : this.selectionList.selectedOptions.selected[0]
    // });
  }

  close() {
    this.dialogRef.close({
      choseToUpdate : false,
      newHostId : ""
    });
  }

}
