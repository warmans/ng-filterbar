import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';

// https://github.com/codemirror/CodeMirror/blob/master/src/input/ContentEditableInput.js
// http://codemirror.net/1/story.html
// https://www.codeproject.com/Questions/897645/Replacing-selected-text-HTML-JavaScript

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

  savedRange: any;

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
    this.saveSelection();
    this.findCurrentToken();

    //todo debounce
    if (evt.code === 'Space') {
      this.render();
      console.log('caret pos', this.caretPos);
      this.restoreSelection();
    }
  }

  updateCaretPos() {
    const range = window.getSelection().getRangeAt(0);
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

  render() {

    this.tokens.forEach((tok, i) => {

      const el = this.renderer.createElement('span');
      el.className = 'var ' + tok.type;
      el.innerText = tok.text;

      let range = document.createRange();
      range.setStart(this.editableContent.nativeElement, tok.start);
      range.setEnd(this.editableContent.nativeElement, tok.end);
      range.deleteContents();
      range.insertNode(el);
      console.log(range);

    });
  }

  saveSelection() {
    if (window.getSelection) {
      this.savedRange = window.getSelection().getRangeAt(0);
    } else if (document.getSelection()) {
      this.savedRange = document.createRange();
    }
  }

  restoreSelection() {
    const isInFocus = true;
    this.editableContent.nativeElement.focus();
    if (this.savedRange != null) {
      if (window.getSelection) {
        const s = window.getSelection();
        if (s.rangeCount > 0) {
          s.removeAllRanges();
        }
        s.addRange(this.savedRange);
      } else if (document.createRange) {
        window.getSelection().addRange(this.savedRange);
      } else if (document.getSelection()) {
        this.savedRange.select();
      }
    }
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

