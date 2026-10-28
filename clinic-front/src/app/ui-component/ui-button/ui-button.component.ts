
import { Component, input } from '@angular/core';

type ButtonType = 'button' | 'submit' | 'reset';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'outline'
  | 'ghost'
  | 'text';

@Component({
  selector: 'app-ui-button',
  template: `
    <button
      class="ui-button"
      [class]="'ui-button ui-button--' + variant()"
      [type]="type()"
      [disabled]="disabled()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-pressed]="ariaPressed()"
    >
      <ng-content />
    </button>
  `,
  styleUrl: './ui-button.component.scss',
})
export class UiButtonComponent {
  readonly type = input<ButtonType>('button');
  readonly variant = input<ButtonVariant>('primary');
  readonly disabled = input(false);
  readonly ariaLabel = input<string | null>(null);
  readonly ariaPressed = input<boolean | null>(null);
}
