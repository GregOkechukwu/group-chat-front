import { Component, OnInit, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'snack-bar',
  templateUrl: './message-archive.component.html',
  styleUrls: ['./message-archive.component.css']
})
export class MessageArchiveComponent implements OnInit {
  constructor(
    private snackBarRef : MatSnackBarRef<MessageArchiveComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any
  ) { }

  ngOnInit() {
  }

  close() {
    this.snackBarRef.dismiss();
  }

}
