import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from 'src/app/interfaces';

@Component({
  selector: 'app-main-dialog',
  templateUrl: './main-dialog.component.html',
  styleUrls: ['./main-dialog.component.css']
})

export class MainDialogComponent implements OnInit {

  constructor(   
    private dialogRef: MatDialogRef<MainDialogComponent>, 
    @Inject(MAT_DIALOG_DATA) private data : DialogData
  ) { }

  ngOnInit() {
  }

  confirm() {
    this.dialogRef.close(true)
  }

  close() {
    this.dialogRef.close(false);
  }

}
