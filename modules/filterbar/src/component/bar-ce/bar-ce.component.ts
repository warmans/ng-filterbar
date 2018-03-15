import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';

const whitespace = [160, 32];

@Component({
  selector: 'ng-filterbar-ce',
  templateUrl: './bar-ce.component.html',
  styleUrls: ['./bar-ce.component.scss'],
})
export class BarCeComponent implements OnInit {


  @ViewChild('editableContent')
  editableContent: ElementRef;

  displayDropdown = true;

  tokens: Token[] = [];

  caretPos: number;

  tokenValues = ['foo', 'bar', 'baz'];

  constructor(private renderer: Renderer2) {

  }

  ngOnInit(): void {

  }

  onClick() {
    this.updateCaretPos();
    this.findCurrentToken();
  }

  onKeypress(evt: KeyboardEvent) {
    this.tokenizeInput();
    this.updateCaretPos();
    this.findCurrentToken();
  }

  updateCaretPos() {
    const range = window.getSelection().getRangeAt(0);
    console.log(range);
    if (range) {
      this.caretPos = range.startOffset;
    }
  }

  insertValue() {
    const foo = this.renderer.createElement('v1');
    foo.className = 'var';
    foo.innerHTML = 'first';
    this.renderer.insertBefore(this.editableContent.nativeElement, this.editableContent.nativeElement.firstChild(), foo);
  }

  tokenizeInput() {
    const text = this.editableContent.nativeElement.textContent.trim();
    this.tokens = [];

    let buffer = '';
    for (let i = 0; i < text.length; i++) {

      const keyCode = text.charCodeAt(i);

      if (whitespace.indexOf(keyCode) === -1) {
        buffer += text.charAt(i);
      }
      if (whitespace.indexOf(keyCode) > -1) {
        if (buffer.length > 0) {
          this.tokens.push({start: i - (buffer.length), end: i, type: 'string', text: buffer});
          buffer = '';
        }
      }
    }
    // :/
    if (buffer !== '') {
      this.tokens.push({start: text.length - buffer.length, end: text.length, type: 'string', text: buffer});
    }
  }

  findCurrentToken(): Token {
    let found = null;
    this.tokens.forEach(tok => {
      if (this.caretPos >= tok.start && this.caretPos <= tok.end) {
        found = tok;
      }
    });
    return found;
  }

  replaceTokenValue(token: Token, newVal: string) {
    const text = this.editableContent.nativeElement.textContent.trim();
    this.editableContent.nativeElement.textContent = spliceSlice(text, token.start, token.end, newVal);
    this.tokenizeInput();
  }
}

interface Token {
  start: number;
  end: number;
  type: string;
  text: string;
}


function spliceSlice(str: string, start: number, end: number, replace: string) {
  if (start < 0) {
    start = str.length + start;
    start = start < 0 ? 0 : start;
  }
  return str.slice(0, start) + (replace || '') + str.slice(end);
}
