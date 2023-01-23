import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  Renderer2,
  ViewChild,
} from '@angular/core';

@Directive({
  selector: '[appSyntaxHighlightedTextarea]',
})
export class SyntaxHighlightedTextareaDirective implements AfterViewInit {
  @ViewChild('queryEditor') queryEditor: ElementRef<HTMLTextAreaElement>;
  @ViewChild('queryEditorBackdrop')
  queryEditorBackdrop: ElementRef<HTMLDivElement>;
  @ViewChild('highlightText') highlightText: ElementRef<HTMLDivElement>;

  @Input()
  applyHighlights: (text: string) => string;

  constructor(private renderer: Renderer2, private textarea: ElementRef) {}

  ngAfterViewInit(): void {
    this.renderer.listen(this.textarea.nativeElement, 'input', (input) => {
      this.handleInput();
    });

    this.renderer.listen(this.textarea.nativeElement, 'scroll', (input) => {
      this.handleScroll();
    });
  }

  handleInput() {
    const text = this.applyHighlights(this.textarea.nativeElement.value);

    this.renderer.setProperty(
      this.highlightText.nativeElement,
      'innerHTML',
      text
    );
  }

  handleScroll() {
    this.renderer.setProperty(
      this.queryEditorBackdrop.nativeElement,
      'scrollTop',
      this.queryEditor.nativeElement.scrollTop
    );
    this.renderer.setProperty(
      this.queryEditorBackdrop.nativeElement,
      'scrollLeft',
      this.queryEditor.nativeElement.scrollLeft
    );
  }
}
