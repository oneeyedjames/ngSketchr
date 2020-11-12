import { NgModule } from '@angular/core';
import {
	MatToolbarModule,
	MatTooltipModule,
	MatSidenavModule,
	MatDialogModule,
	MatButtonModule,
	MatButtonToggleModule,
	MatIconModule
} from '@angular/material';

@NgModule({
	imports: [
		MatToolbarModule,
		MatTooltipModule,
		MatSidenavModule,
		MatDialogModule,
		MatButtonModule,
		MatButtonToggleModule,
		MatIconModule
	],
	exports: [
		MatToolbarModule,
		MatTooltipModule,
		MatSidenavModule,
		MatDialogModule,
		MatButtonModule,
		MatButtonToggleModule,
		MatIconModule
	]
})
export class MaterialModule {}
