import { Component, OnInit, Input, AfterViewInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { ImageService } from 'src/app/services/image.service';
import { ActivatedRoute } from '@angular/router';
import { ResolverMetaData } from 'src/app/interfaces';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-conversation-display',
  templateUrl: './conversation-display.component.html',
  styleUrls: ['./conversation-display.component.css']
})
export class ConversationDisplayComponent implements OnInit, AfterViewInit {

  @Output() goToChatRoom : EventEmitter<string> = new EventEmitter<string>();
  @Output() leave : EventEmitter<{conversationId : string, hostId : string}> = new EventEmitter<{conversationId : string, hostId : string}>();

  @Input() index : number;
  @Input() conversationId : string;
  @Input() conversationName : string;
  @Input() conversationHostId : string;
  @Input() conversationHostUsername : string;
  @Input() userCount : number;
  @Input() hostUser_Base64 : string;
  @Input() hostUser_MimeType : string;
  @Input() hostUser_hasProfilePic : boolean;
  @Input() userA_Base64 : string | undefined;
  @Input() userA_MimeType : string | undefined;
  @Input() userA_hasProfilePic : boolean | undefined;
  @Input() userB_Base64 : string | undefined;
  @Input() userB_MimeType : string | undefined;
  @Input() userB_hasProfilePic : boolean | undefined;

  userId : string;
  hostPic : string;
  userAPic : string | null;
  userBPic : string | null;

  subscriptions : Subscription[] = [];
  borderColorLookup : Map<number, string>;

  constructor(private imageService : ImageService, private activatedRoute : ActivatedRoute) { }

  ngOnChanges(changes : SimpleChanges) {
  }

  ngOnInit() {
    this.conversationName = this.conversationName.toUpperCase();
    this.hostPic = this.userCount > 0 ? this.getEncodedPic(this.hostUser_Base64, this.hostUser_MimeType) : this.hostPic;
    this.userAPic = this.userCount > 1 ? this.getEncodedPic(this.userA_Base64, this.userA_MimeType) : this.userAPic;
    this.userBPic  = this.userCount > 2 ? this.getEncodedPic(this.userB_Base64, this.userA_MimeType) : this.userBPic;

    this.borderColorLookup = this.getBorderColorLookup();

    const subscription = this.activatedRoute.data.subscribe((data : ResolverMetaData) => {
      this.userId = data.user.userId;
    });

    this.subscriptions.push(subscription);
  }

  ngAfterViewInit() {
  }

  getEncodedPic(base64 : string, mimeType : string) {
    const src = this.imageService.encodePic(base64, mimeType);
    return <string>this.imageService.sanitize(src);
  }

  getMemberCount() {
    return this.userCount === 1 ? `${this.userCount} member` : `${this.userCount} members`;
  }

  getBorderColorLookup() {
    const borderColorLookup = new Map<number, string>();
    const hasPicStatus = new Array<boolean>();
    const n = this.userCount;

    if (n > 2) hasPicStatus.push(this.userB_hasProfilePic);
    if (n > 1) hasPicStatus.push(this.userA_hasProfilePic);
    if (n > 0) hasPicStatus.push(this.hostUser_hasProfilePic);

    for (let i = 0; i < n; i++) {
      const prevHasPic = i - 1 >= 0 ? hasPicStatus[i - 1] : false;
      const nextHasPic = i + 1 < n ? hasPicStatus[i + 1] : false;

      if (hasPicStatus[i] && !prevHasPic && !nextHasPic) {
        borderColorLookup.set(i, 'black');
      }
      else {
        borderColorLookup.set(i, 'white');
      }
    }

    return borderColorLookup;
  }

  styleBorder(idx : number) {
    return {
      'border' : `1px solid ${this.borderColorLookup.get(idx)}`
    }
  }

  goToChat() {
    this.goToChatRoom.emit(this.conversationId);
  }

  onLeave() {
    this.leave.emit({ conversationId : this.conversationId, hostId : this.conversationHostId });
  }

  isCurrentHost() {
    return this.userId === this.conversationHostId;
  }
}
