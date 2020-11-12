import { Inject, Component } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";

@Component({
	templateUrl: './dialog.component.html'
})
export class DialogComponent {
	title: string;
	message: string;
	okColor: string;

	constructor(
		private dialogRef: MatDialogRef<DialogComponent>,
		@Inject(MAT_DIALOG_DATA) data
	) {
		this.title = data.title;
		this.message = data.message;
		this.okColor = data.warn ? 'warn' : 'primary';
	}

	confirm() {
		this.dialogRef.close(true);
	}

	cancel() {
		this.dialogRef.close(false);
	}
}
