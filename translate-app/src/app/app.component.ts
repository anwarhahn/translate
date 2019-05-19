import * as _ from "lodash";

import { Component } from "@angular/core";
import {
  TranslateService,
  ITranslation,
  ICounts,
} from "./translate/translate.service";

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

  public characterCount: number = 0;
  public wordCount: number = 0;
  public lineCount: number = 0;

  constructor(private translationService: TranslateService) {}

  public onTranslateClicked(): void {
    const selector = !this.disableSelector ? this.selector : "";
    this.translationService
      .translate(this.url, selector)
      .subscribe((data: ITranslation) => {
        this.textOriginal = _.get(data, "original.data");
        this.textTranslated = _.get(data, "translation.data");
        const counts: ICounts = _.get(data, "original.counts");
        if (!_.isNil(counts)) {
          this.characterCount = counts.characterCount;
          this.wordCount = counts.wordCount;
          this.lineCount = counts.lineCount;
        }
      });
  }
}
