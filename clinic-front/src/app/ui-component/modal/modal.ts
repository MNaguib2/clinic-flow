
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
  styleUrl: './modal.scss',
  imports: [CommonModule],
})
export class Modal implements AfterViewInit, OnDestroy {
  @ViewChild('dialogElement', { static: true })
  private dialogElement!: ElementRef<HTMLDialogElement>;

  // ========================================
  // Inputs
  // ========================================

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

  // ========================================
  // Outputs
  // ========================================

  @Output() closed = new EventEmitter<void>();
  @Output() primaryAction = new EventEmitter<void>();
  @Output() secondaryAction = new EventEmitter<void>();
  @Output() expandedChange = new EventEmitter<boolean>();

  // ========================================
  // Custom templates
  // ========================================

  @ContentChild(ModalHeaderDirective)
  customHeader?: ModalHeaderDirective;

  @ContentChild(ModalBodyDirective)
  customBody?: ModalBodyDirective;

  @ContentChild(ModalFooterDirective)
  customFooter?: ModalFooterDirective;

  // ========================================
  // State
  // ========================================

  expanded = false;

  private destroyed = false;

  // ========================================
  // Lifecycle
  // ========================================

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

  // ========================================
  // Dialog actions
  // ========================================

  close(): void {
    const dialog = this.dialogElement.nativeElement;

    if (dialog.open) {
      dialog.close();
    }
  }

  onDialogClick(event: MouseEvent): void {
    const dialog = this.dialogElement.nativeElement;

    if (
      event.target === dialog &&
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
    if (this.destroyed) {
      return;
    }

    this.expanded = false;
    this.closed.emit();
  }

  // ========================================
  // Footer actions
  // ========================================

  onPrimaryAction(): void {
    if (this.loading() || this.primaryDisabled()) {
      return;
    }

    this.primaryAction.emit();
  }

  onSecondaryAction(): void {
    this.secondaryAction.emit();
  }

  // ========================================
  // Expand / Restore
  // ========================================

  toggleExpanded(): void {
    if (!this.expandable()) {
      return;
    }

    this.expanded = !this.expanded;
    this.expandedChange.emit(this.expanded);
  }
}
