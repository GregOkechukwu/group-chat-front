import { Component,  OnInit,  EventEmitter,  Output, ViewChild } from '@angular/core';
import { ImageService } from 'src/app/services/image.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CacheService } from 'src/app/services/cache.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalContent } from '../modal/modal-content.component';

@Component({
  selector :  'app-upload-pic', 
  templateUrl :  './upload-pic.component.html', 
  styleUrls :  ['./upload-pic.component.css']
})
export class UploadPicComponent implements OnInit {

  subscriptionOne : Subscription;

  showDelete : boolean;
  showUpload : boolean
  hasProfilePic : boolean;
  
  mimeType : string;  
  defaultPic : string;
  profilePic :  string;
  
  @ViewChild('img') imageElement : HTMLInputElement;
  @Output() updatedPic : EventEmitter<void> = new EventEmitter<void>();
  @Output() goPrevious : EventEmitter<void> = new EventEmitter<void>();

  constructor(private imageService : ImageService,  private activatedRoute : ActivatedRoute, private cache : CacheService, private modalService : NgbModal) { }

  ngOnInit() {
    const picNotifier = this.imageService.profilePicNotifier;
    const picNotifier$ = this.imageService.profilePicNotifier$;

    this.subscriptionOne = picNotifier$.subscribe((src : string) => {
      if (src) {
        this.updatePicInfo(src);

      }
    }, err => console.log(err));

    picNotifier.next(<string>this.imageService.pic);
  }

  ngOnDestroy() {
    if (this.subscriptionOne  instanceof Subscription) this.subscriptionOne.unsubscribe()
  }

  updatePicInfo(src : string) {
    this.showDelete = this.hasProfilePic = this.imageService.hasProfilePic;
    this.profilePic = this.hasProfilePic ? src : undefined;
    this.defaultPic = this.hasProfilePic ? undefined : src;
  }

  onFileChange(file : File = null) {
    if (file instanceof Blob) {
      this.hasProfilePic = true;
      this.mimeType = file.type;

      const urlReader = new FileReader();

      urlReader.onload = (event : any) => { 
        this.profilePic = <string>this.imageService.sanitize(urlReader.result as string);
        this.showDelete = false;
        this.showUpload = true;
      }

      urlReader.readAsDataURL(file);
    }
  }

  uploadPic() {
    const picNotifier = this.imageService.profilePicNotifier;

    if (this.profilePic) {
      this.imageService.savePic(<string>this.profilePic, this.mimeType).subscribe(data => {
        this.imageService.pic = this.profilePic;
        this.imageService.hasProfilePic = true;

        picNotifier.next(this.profilePic); 
        
        this.updatedPic.emit();
        this.showUpload = false;

      }, err => console.log(err));
    }
  }

  removePic() {
    const picNotifier = this.imageService.profilePicNotifier;

    if (this.hasProfilePic) {
      this.imageService.deletePic().subscribe(data => {
        this.imageElement.value = "";
        this.imageService.hasProfilePic = false;
        this.imageService.pic = undefined;

        this.imageService.getDefaultPic(this.cache, (err, data) => {
          if (err) {
            console.log(err);
          }
          else {
            this.imageService.pic = this.imageService.sanitize(data);
            picNotifier.next(<string>this.imageService.pic);
          }
        });

      }, err => console.log(err));
    }
  }

  openModal(header : string, mssg : string) {
    const modalRef = this.modalService.open(ModalContent, {centered : true});

    modalRef.componentInstance.header = header;
    modalRef.componentInstance.mssg = mssg;

    modalRef.result.then(confirm => {
      if (confirm === 'Update') {
        this.uploadPic();
      } else {
        this.removePic();
      }
    }, dismiss => {});
  }

  goBack() {
    this.goPrevious.emit();
  }

}
