import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { CoachService, Coach } from '../../services/coach';

@Component({
  selector: 'app-coaches',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coaches.html'
})
export class CoachesComponent {
  list: Coach[] = [];
  form: Coach = { name: '', specialty: '' };
  err = '';

  constructor(private api: CoachService) {}

  async ngOnInit(){ this.list = await this.api.list().catch(()=>[]); }

  async add(f: NgForm) {
    this.err = '';
    if (f.invalid) { this.err = 'Fill required fields.'; return; }
    await this.api.create(this.form);
    f.resetForm();
    this.list = await this.api.list();
  }

  async remove(id?: number) {
    if (!id) return;
    await this.api.remove(id);
    this.list = await this.api.list();
  }
}
