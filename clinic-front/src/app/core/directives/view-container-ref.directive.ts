import {
  Directive,
  ViewContainerRef,
  ComponentRef,
  Type,
} from '@angular/core';

@Directive({
  selector: '[modalPlaceholder]',
  standalone: true,
})
export class ModalPlaceholderDirective {
  constructor(private viewContainerRef: ViewContainerRef) {}

  open<T>(component: Type<T>): ComponentRef<T> {
    this.viewContainerRef.clear();

    return this.viewContainerRef.createComponent(component);
  }

  close(): void {
    this.viewContainerRef.clear();
  }
}
