
import {
  Directive,
  TemplateRef,
} from '@angular/core';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl' | 'full';

@Directive({
  selector: 'ng-template[modalHeader]',
  standalone: true,
})
export class ModalHeaderDirective {
  constructor(
    readonly template: TemplateRef<unknown>,
  ) {}
}

@Directive({
  selector: 'ng-template[modalBody]',
  standalone: true,
})
export class ModalBodyDirective {
  constructor(
    readonly template: TemplateRef<unknown>,
  ) {}
}

@Directive({
  selector: 'ng-template[modalFooter]',
  standalone: true,
})
export class ModalFooterDirective {
  constructor(
    readonly template: TemplateRef<unknown>,
  ) {}
}
