import { Component, computed, input } from '@angular/core';

/** Renders an SVG from `public/images/icons` tinted with `currentColor`. */
@Component({
  selector: 'app-icon',
  template: '',
  styles: `
    :host {
      display: inline-block;
      width: 1.25em;
      height: 1.25em;
      flex-shrink: 0;
      background-color: currentColor;
      mask: var(--icon-url) center / contain no-repeat;
      -webkit-mask: var(--icon-url) center / contain no-repeat;
    }
  `,
  host: {
    'aria-hidden': 'true',
    '[style.--icon-url]': 'url()',
  },
})
export class Icon {
  readonly name = input.required<string>();
  protected readonly url = computed(() => `url("/images/icons/${this.name()}.svg")`);
}
