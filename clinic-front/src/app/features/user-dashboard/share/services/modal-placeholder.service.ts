import { Injectable } from "@angular/core";
import { ModalPlaceholderDirective } from "@core/directives/view-container-ref.directive";

@Injectable()
export class ModalPlaceholderService {
  constructor() {}
  private _viewContainerRef!: ModalPlaceholderDirective;

  set viewContainerRef(ref: ModalPlaceholderDirective) {
    this._viewContainerRef = ref;
  }

  get viewContainerRef(): ModalPlaceholderDirective {
    return this._viewContainerRef;
  }
}
