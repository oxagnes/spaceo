import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeamHomeComponent } from './team-home.component';

const routes: Routes = [
  {
    path: '',
    component: TeamHomeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeamRoutingModule {}
