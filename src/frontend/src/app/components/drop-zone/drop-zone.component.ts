import { environment } from '../../../environments/environment';
import {
  Component,
  Input,
  ViewEncapsulation,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { NgxFileDropEntry, FileSystemFileEntry } from 'ngx-file-drop';
import { BackendService } from 'src/app/services/backendService/backend.service';
import { DropZoneDirective } from 'src/app/directives/drop-zone/drop-zone.directive';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-drop-zone',
  templateUrl: './drop-zone.component.html',
  styleUrls: ['./drop-zone.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DropZoneComponent extends DropZoneDirective implements OnInit {
  file: NgxFileDropEntry = null;
  showText: boolean;
  dropZoneText: SafeStyle;
  @Input() dropzoneConfig: DropzoneConfig;
  @Output() fileOnHover: EventEmitter<boolean> = new EventEmitter<boolean>(
    false
  );

  dropZoneDirective = DropZoneDirective;

  constructor(
    private sanitizer: DomSanitizer,
    private backendService: BackendService
  ) {
    super();
  }

  ngOnInit() {
    this.dropZoneText = this.sanitizer.bypassSecurityTrustHtml(
      this.dropzoneConfig.dropZoneHoverMessage
    );
  }

  fileOver(event) {
    this.fileOnHover.emit(true);
    this.showText = true;
  }

  fileLeave(event) {
    this.fileOnHover.emit(false);
    this.showText = false;
  }

  importDroppedFile(files: NgxFileDropEntry[]) {
    if (files.length > 1) {
      Swal.fire({
        title:
          '<tspan class = "text-warning">Multiple Files not supported </tspan>',
        html:
          '<b>Error Message: </b><br>' +
          '<code> The dropzone does not support directories or multiple files at once.\
                 Select a single file of the supported format and try again\
                 </code> <br> <br> Supported Formats: ' +
          '<tspan class = "text-danger">' +
          this.dropzoneConfig.acceptedFormats +
          '</tspan>',
        icon: 'warning',
        showCloseButton: false,
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: 'close',
      });
    } else {
      // Send a general User Warning, that this Action is not supported
      this.file = files[0];

      if (this.file.fileEntry.isFile) {
        const fileName: string = this.file.fileEntry.name;
        const fileEnding: string = fileName.slice(
          fileName.lastIndexOf('.'),
          fileName.length
        );
        const fileEntry = this.file.fileEntry as FileSystemFileEntry;

        if (this.dropzoneConfig.acceptedFormats.includes(fileEnding)) {
          fileEntry.file((file: File) => {
            switch (fileEnding) {
              case '.xes':
                !environment.electron
                  ? this.backendService.uploadEventLog(file)
                  : this.backendService.loadEventLogFromFilePath(file['path']);
                break;

              case '.ptml':
                this.backendService.loadProcessTreeFromFilePath(file['path']);
                break;
              default:
                break;
            }
          });
        } else {
          Swal.fire({
            title: '<tspan class = "text-warning">Wrong File Format</tspan>',
            html:
              '<b>Error Message: </b><br>' +
              '<code> The dropped files format is not supported.\
                     File not uploaded. Check the format and try again\
                     </code> <br> <br> Supported Formats: ' +
              '<tspan class = "text-danger">' +
              this.dropzoneConfig.acceptedFormats +
              '</tspan>',
            icon: 'warning',
            showCloseButton: false,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: 'close',
          });
        }
      } else {
        Swal.fire({
          title:
            '<tspan class = "text-warning">Directory not supported</tspan>',
          html:
            '<b>Error Message: </b><br>' +
            '<code> The dropzone does not support directories.\
                   Select a single file of the supported format and try again\
                   </code> <br> <br> Supported Formats: ' +
            '<tspan class = "text-danger">' +
            this.dropzoneConfig.acceptedFormats +
            '</tspan>',
          icon: 'warning',
          showCloseButton: false,
          showConfirmButton: false,
          showCancelButton: true,
          cancelButtonText: 'close',
        });
      }
    }

    DropZoneDirective.windowDrag = false;
    this.fileOnHover.emit(false);
    this.showText = false;
  }
}

export class DropzoneConfig {
  acceptedFormats: string;
  directory: string;
  multiple: string;
  dropZoneHoverMessage: string;

  constructor(
    acceptedFormats: string,
    directory: string,
    multiple: string,
    dropZoneHoverMessage: string
  ) {
    this.acceptedFormats = acceptedFormats;
    this.directory = directory;
    this.multiple = multiple;
    this.dropZoneHoverMessage = dropZoneHoverMessage;
  }
}
