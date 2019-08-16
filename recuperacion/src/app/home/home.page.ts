import { Component, ViewChild } from '@angular/core';
import {Geolocation,Geoposition}from'@ionic-native/geolocation/ngx';
import { Camera } from '@ionic-native/Camera/ngx';
import { File } from '@ionic-native/File/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { MediaCapture , CaptureVideoOptions, MediaFile} from '@ionic-native/media-capture/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { Storage } from '@ionic/storage';

const MEDIA_FILE_KEY='mediaFiles';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  @ViewChild('myvideo',{static: false}) myVideo: any;
  longitude: any="";
  latitude: any="";
  timestamp:any="";
  mediaFiles = [];

  constructor(public geolocation:Geolocation, private mediaCapture:MediaCapture, private storage:Storage,
    private media:Media, private file:File) {
    this.getPosition();
  }

  getPosition(){
    this.geolocation.getCurrentPosition().then((geoposition: Geoposition)=>{
      this.latitude = geoposition.coords.latitude.toString();
      this.longitude = geoposition.coords.longitude.toString();
      this.timestamp= (new Date(geoposition.timestamp)).toString();
    });
  }

  ionViewLoad(){
    this.storage.get(MEDIA_FILE_KEY).then(res =>{
      this.mediaFiles=JSON.parse(res)||[];
    });
  }

  captureAudio(){
    this.mediaCapture.captureAudio().then(res =>{
      this.storeMediaFiles(res);
    });
  }

  captureVideo(){

    let options:CaptureVideoOptions={
      limit:1,
      duration:30
    }
    this.mediaCapture.captureVideo().then((res:MediaFile[]) =>{
      let captureFile=res[0];
      console.log('my file: ', captureFile);

      let fileName = captureFile.name;
      let dir = captureFile['localURL'].split('/');
      dir.pop();
      let fromDirectory = dir.join('/');
      let toDirectory = this.file.dataDirectory;

      this.file.copyFile(fromDirectory, fileName, toDirectory, fileName).then(res =>{
        //
        this.storeMediaFiles([{name: fileName, size: captureFile.size/*, localURL:url*/}]);
      });
    });
  }

  play(myFile){
    console.log('play: ', myFile);
    if (myFile.name.indexOf('.wav')> -1) {
      const audioFile: MediaObject=this.media.create(myFile.localURL);
      audioFile.play();
    } else {
      let path = this.file.dataDirectory+myFile.name;
      let url=path.replace(/^file:\/\//,'');
      let video=this.myVideo.nativeElement;
      video.src=url;
      video.play();
    }
  }

  storeMediaFiles(files){

    console.log('store: ', files);
    this.storage.get(MEDIA_FILE_KEY).then(res =>{
      if (res) {
        let arr=JSON.parse(res);
        arr = arr.concat(files);
        this.storage.set(MEDIA_FILE_KEY,JSON.stringify(arr));
      }else{
        this.storage.set(MEDIA_FILE_KEY,JSON.stringify(files));
      }
      this.mediaFiles=this.mediaFiles.concat(files);


    });
  }

  ngOnInit() {
  }
}
