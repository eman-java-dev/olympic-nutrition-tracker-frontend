import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { LangService } from '../services/lang';
import type { ListPage } from '../services/api';

@Component({
    selector: 'app-list-pager',
    imports: [CommonModule],
    template: `
    <nav *ngIf="page && page.totalPages > 1" [attr.aria-label]="t('pager.label')"
         style="display:flex; flex-wrap:wrap; align-items:center; gap:12px; margin-top:12px;">
      <button class="btn btn-ghost shine" type="button" [disabled]="disabled || page.number === 0"
              (click)="pageChange.emit(page.number - 1)">
        {{ t('pager.previous') }}
      </button>
      <span>{{ t('pager.page') }} {{ page.number + 1 }} {{ t('pager.of') }} {{ page.totalPages }}</span>
      <button class="btn btn-ghost shine" type="button" [disabled]="disabled || page.number + 1 >= page.totalPages"
              (click)="pageChange.emit(page.number + 1)">
        {{ t('pager.next') }}
      </button>
    </nav>
  `
})
export class ListPagerComponent {
  @Input() page: ListPage<unknown> | null = null;
  @Input() disabled = false;
  @Output() pageChange = new EventEmitter<number>();

  private readonly lang = inject(LangService);
  protected t = (key: string) => this.lang.t(key);
}
