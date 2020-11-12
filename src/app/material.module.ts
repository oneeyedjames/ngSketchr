import { NgModule } from '@angular/core';
import {
	MatToolbarModule,
	MatSidenavModule,
	MatButtonModule,
	MatIconModule,
	MatTooltipModule
} from '@angular/material';

@NgModule({
	imports: [
		MatToolbarModule,
		MatSidenavModule,
		MatButtonModule,
		MatIconModule,
		MatTooltipModule
	],
	exports: [
		MatToolbarModule,
		MatSidenavModule,
		MatButtonModule,
		MatIconModule,
		MatTooltipModule
	]
})
export class MaterialModule {}
