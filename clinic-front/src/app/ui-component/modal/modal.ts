
import {
  AfterViewInit,
  booleanAttribute,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ModalSize,
  ModalHeaderDirective,
  ModalBodyDirective,
  ModalFooterDirective,
} from './modal-header.directive';

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.html',
  styleUrls: ['./modal.scss'],
  imports: [CommonModule],
})
export class Modal implements AfterViewInit, OnDestroy {
  @ViewChild('dialogElement', { static: true })
  private dialogElement!: ElementRef<HTMLDialogElement>;

  readonly title = input('');
  readonly subtitle = input('');

  readonly size = input<ModalSize>('md');

  readonly expandable = input(false, {
    transform: booleanAttribute,
  });

  readonly closeOnBackdrop = input(true, {
    transform: booleanAttribute,
  });

  readonly closeOnEscape = input(true, {
    transform: booleanAttribute,
  });

  readonly showCloseButton = input(true, {
    transform: booleanAttribute,
  });

  readonly showFooter = input(true, {
    transform: booleanAttribute,
  });

  readonly primaryLabel = input('Save');
  readonly secondaryLabel = input('Cancel');

  readonly showPrimaryAction = input(true, {
    transform: booleanAttribute,
  });

  readonly showSecondaryAction = input(true, {
    transform: booleanAttribute,
  });

  readonly primaryDisabled = input(false, {
    transform: booleanAttribute,
  });

  readonly loading = input(false, {
    transform: booleanAttribute,
  });

  @Output() closed = new EventEmitter<void>();
  @Output() primaryAction = new EventEmitter<void>();
  @Output() secondaryAction = new EventEmitter<void>();
  @Output() expandedChange = new EventEmitter<boolean>();

  @ContentChild(ModalHeaderDirective)
  customHeader?: ModalHeaderDirective;

  @ContentChild(ModalBodyDirective)
  customBody?: ModalBodyDirective;

  @ContentChild(ModalFooterDirective)
  customFooter?: ModalFooterDirective;

  expanded = false;

  private destroyed = false;

  ngAfterViewInit(): void {
    const dialog = this.dialogElement.nativeElement;

    if (!dialog.open) {
      dialog.showModal();
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;

    const dialog = this.dialogElement.nativeElement;

    if (dialog.open) {
      dialog.close();
    }
  }

  close(): void {
    const dialog = this.dialogElement.nativeElement;

    if (dialog.open) {
      dialog.close();
    }
  }

  onDialogClick(event: MouseEvent): void {
    if (
      event.target === this.dialogElement.nativeElement &&
      this.closeOnBackdrop()
    ) {
      this.close();
    }
  }

  onCancel(event: Event): void {
    if (!this.closeOnEscape()) {
      event.preventDefault();
    }
  }

  onNativeClose(): void {
    if (!this.destroyed) {
      this.closed.emit();
    }
  }

  onPrimaryAction(): void {
    if (this.loading() || this.primaryDisabled()) {
      return;
    }

    this.primaryAction.emit();
  }

  onSecondaryAction(): void {
    this.secondaryAction.emit();
  }

  toggleExpanded(): void {
    if (!this.expandable()) {
      return;
    }

    this.expanded = !this.expanded;
    this.expandedChange.emit(this.expanded);
  }
}
