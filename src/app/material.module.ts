import { NgModule } from '@angular/core';
import {
	MatToolbarModule,
	MatTooltipModule,
	MatSidenavModule,
	MatButtonModule,
	MatButtonToggleModule,
	MatIconModule
} from '@angular/material';

@NgModule({
	imports: [
		MatToolbarModule,
		MatTooltipModule,
		MatSidenavModule,
		MatButtonModule,
		MatButtonToggleModule,
		MatIconModule
	],
	exports: [
		MatToolbarModule,
		MatTooltipModule,
		MatSidenavModule,
		MatButtonModule,
		MatButtonToggleModule,
		MatIconModule
	]
})
export class MaterialModule {}
