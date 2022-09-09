import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

interface LetContext<T> {
  fcLet: T | null;
}

@Directive({
  selector: '[fcLet]',
})
export class LetDirective<T> {
  private context: LetContext<T> = { fcLet: null };

  constructor(
    viewContainer: ViewContainerRef,
    templateRef: TemplateRef<LetContext<T>>
  ) {
    viewContainer.createEmbeddedView(templateRef, this.context);
  }

  @Input()
  set fcLet(value: T) {
    this.context.fcLet = value;
  }
}
