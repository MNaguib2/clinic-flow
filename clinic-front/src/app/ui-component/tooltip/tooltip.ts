
import {
  Component,
  computed,
  input,
} from '@angular/core';

type TooltipPosition = 'top' | 'bottom' | 'start' | 'end';

@Component({
  selector: 'app-tooltip',
  template: `
        <span
          class="tooltip"
          [class.tooltip--disabled]="disabled()"
          [class]="positionClass()"
          [attr.role]="'tooltip'"
          [attr.id]="tooltipId"
          [attr.aria-hidden]="disabled() ? 'true' : null"
        >
          <span class="tooltip__content">
            {{ text() }}
          </span>

          @if (showArrow()) {
            <span class="tooltip__arrow" aria-hidden="true"></span>
          }
        </span>
        `,
  styleUrls: ['./tooltip.scss']
})
export class Tooltip {
  readonly text = input.required<string>();

  readonly position = input<TooltipPosition>('top');

  readonly showArrow = input(true);

  readonly disabled = input(false);

  readonly tooltipId = `tooltip-${Math.random()
    .toString(36)
    .slice(2, 11)}`;

  readonly positionClass = computed(
    () => `tooltip--${this.position()}`,
  );
}
