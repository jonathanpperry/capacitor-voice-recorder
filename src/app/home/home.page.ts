import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { GestureController } from '@ionic/angular';
import { RecordingData, VoiceRecorder } from 'capacitor-voice-recorder';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit {
  recording = false;
  storedFileNames = [];
  durationDisplay = '';
  duration = 0;
  @ViewChild('recordbtn', { read: ElementRef }) recordbtn: ElementRef;

  constructor(private gestureCtrl: GestureController) {}

  ngOnInit() {
    this.loadFiles();

    VoiceRecorder.requestAudioRecordingPermission();
  }

  ngAfterViewInit() {
    const longpress = this.gestureCtrl.create(
      {
        el: this.recordbtn.nativeElement,
        threshold: 0,
        gestureName: 'long-press',
        onStart: (ev) => {
          Haptics.impact({ style: ImpactStyle.Light });
          this.startRecording();
        },
        onEnd: (ev) => {
          Haptics.impact({ style: ImpactStyle.Light });
          this.stopRecording();
        },
      },
      true
    );
    longpress.enable();
  }

  calculateDuration() {
    if (!this.recording) {
      this.duration = 0;
      this.durationDisplay = '';
      return;
    }
    this.duration += 1;
    const minutes = Math.floor(this.duration / 60);
    const seconds = (this.duration % 60).toString().padStart(2, '0');
    this.durationDisplay = `${minutes}:${seconds}`;

    setTimeout(() => {
      this.calculateDuration();
    }, 1000);
  }

  async loadFiles() {
    Filesystem.readdir({
      path: '',
      directory: Directory.Data,
    }).then((result) => {
      this.storedFileNames = result.files;
    });
  }

  startRecording() {
    if (this.recording) {
      return;
    }

    this.recording = true;
    VoiceRecorder.startRecording();
  }

  stopRecording() {
    if (!this.recording) {
      return;
    }
    VoiceRecorder.stopRecording().then(async (result: RecordingData) => {
      this.recording = false
      if (result.value && result.value.recordDataBase64) {
        const recordData = result.value.recordDataBase64;

        const fileName = new Date().getTime() + '.wav';

        await Filesystem.writeFile({
          path: fileName,
          directory: Directory.Data,
          data: recordData,
        });
      }
    });
  }

  async playFile(fileName) {
    const audioFile = await Filesystem.readFile({
      path: fileName,
      directory: Directory.Data,
    });

    const base64Sound = audioFile.data;

    const audioRef = new Audio(`data:audio/aac;base64,${base64Sound}`);
    audioRef.oncanplaythrough = () => audioRef.play();
    audioRef.load();
  }
}
