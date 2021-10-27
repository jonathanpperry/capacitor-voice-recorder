import { Component, OnInit } from '@angular/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { RecordingData, VoiceRecorder } from 'capacitor-voice-recorder';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  recording = false;
  storedFileNames = [];
  constructor() {}

  ngOnInit() {
    this.loadFiles();

    VoiceRecorder.requestAudioRecordingPermission();
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
}
