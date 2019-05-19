import * as _ from "lodash";

import { Component } from "@angular/core";
import { TranslateService, Translation } from "./translate/translate.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "translate-app";

  public url = "";
  public selector = "";
  public disableSelector = false;

  public textOriginal = "";
  public textTranslated = "";

  constructor(private translationService: TranslateService) {}

  public onTranslateClicked(): void {
    const selector = !this.disableSelector ? this.selector : "";
    this.translationService
      .translate(this.url, selector)
      .subscribe((data: Translation) => {
        this.textOriginal = _.defaultTo(data.original, "");
        this.textTranslated = _.defaultTo(data.translation, "");
      });
  }
}
