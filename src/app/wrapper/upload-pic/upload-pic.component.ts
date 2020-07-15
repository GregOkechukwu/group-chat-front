import { Component,  OnInit,  EventEmitter,  Output, ViewChild } from '@angular/core';
import { ImageService } from 'src/app/services/image.service';
import { Subscription } from 'rxjs';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector :  'app-upload-pic', 
  templateUrl :  './upload-pic.component.html', 
  styleUrls :  ['./upload-pic.component.css']
})
export class UploadPicComponent implements OnInit {

  subscriptions : Subscription[] = [];

  showDeleteBtn : boolean;
  showUploadBtn : boolean
  hasProfilePic : boolean;
  
  mimeType : string;  
  defaultPic : string;
  profilePic :  string;
  profilePicBuffer : ArrayBuffer;

  
  @ViewChild('img') imageElement : HTMLInputElement;
  @Output() goToUpdateDefault : EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private uiService : UiService,
    private imageService : ImageService
  ) { }

  ngOnInit() {
    const picNotifier = this.imageService.profilePicNotifier;
    const picNotifier$ = this.imageService.profilePicNotifier$;

    const subscription = picNotifier$.subscribe((src : string) => {
      if (src) {
        this.updatePicInfo(src);
      }
    });

    picNotifier.next(<string>this.imageService.pic);
    this.subscriptions.push(subscription);
  }

  ngOnDestroy() {
    this.uiService.unsubscribeFromSubscriptions(this.subscriptions);
  }

  updatePicInfo(src : string) {
    this.showDeleteBtn = this.hasProfilePic = this.imageService.hasProfilePic;
    this.profilePic = this.hasProfilePic ? src : undefined;
    this.defaultPic = this.hasProfilePic ? undefined : src;
  }

  onFileChange(file : File = null) {
    if (file instanceof Blob) {
      this.hasProfilePic = true;
      this.mimeType = file.type;

      const urlReader = new FileReader();
      const bufferReader = new FileReader();

      urlReader.onload = (event : any) => {
        this.profilePic = <string>this.imageService.sanitize(urlReader.result as string);
        this.showDeleteBtn = false;
        this.showUploadBtn = true;
      }

      bufferReader.onload = (event : any) => {
        this.profilePicBuffer = <ArrayBuffer>bufferReader.result;
      }

      urlReader.readAsDataURL(file);
      bufferReader.readAsArrayBuffer(file);
    }
  }

  confirmUpload() {
    const heightPx = "225px", widthPx = "500px";

    this.uiService.openDialog(
      heightPx,
      widthPx,
      "Confirm Upload", 
      "Are you sure you want to update your profile pic?",
      choseToUpdatePic => {
        if (!choseToUpdatePic) return;

        this.uiService.startLoadingScreen();

        this.uploadPic(successfulUpload => {
          if (!successfulUpload) return;

          this.uiService.stopLoadingScreen();
          this.uiService.openSnackBar('Updated Pic Successfully'); 
          this.goToUpdateDefault.emit(); 
        });
      }
    );
  }

  confirmDelete() {
    const heightPx = "225px", widthPx = "500px";

    this.uiService.openDialog(
      heightPx,
      widthPx,
      "Confirm Delete", 
      "Are you sure you want to delete your profile pic?",
      choseToDeletePic => {
        if (!choseToDeletePic) return;

        this.uiService.startLoadingScreen();

        this.deletePic((successfulDelete : boolean) => {
          if (!successfulDelete) return;

          this.uiService.stopLoadingScreen();
          this.uiService.openSnackBar('Updated Pic Successfully');
          this.goToUpdateDefault.emit(); 
        });
      }
    );  
  }

  uploadPic(doSomething : Function) {
    if (this.profilePicBuffer === undefined) {
      return;
    }

    const picNotifier = this.imageService.profilePicNotifier;
    const subscription  = this.imageService.savePic(this.profilePicBuffer, this.mimeType).subscribe(() => {
      this.imageService.pic = this.profilePic;
      this.imageService.hasProfilePic = true;
      this.showUploadBtn = false;

      picNotifier.next(this.profilePic); 
      doSomething(true);
     
    }, err => doSomething(false));

    this.subscriptions.push(subscription);
  }

  deletePic(doSomething : Function) {
    if (!this.hasProfilePic) {
      return;
    }

    const picNotifier = this.imageService.profilePicNotifier;
    const subscription = this.imageService.deletePic().subscribe(() => {
      this.imageElement.value = "";
      this.imageService.hasProfilePic = false;
      this.imageService.pic = undefined;

      this.imageService.getDefaultPic((err, data) => {
        if (err) {
          doSomething(false);
        }
        else {
          this.imageService.pic = this.imageService.sanitize(data);
          picNotifier.next(<string>this.imageService.pic);
          doSomething(true);
        }
      });

    }, err => doSomething(false));
    
    this.subscriptions.push(subscription);
  }
}
