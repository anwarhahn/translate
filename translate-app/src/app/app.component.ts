import * as _ from "lodash";

import { Component } from "@angular/core";
import {
  TranslateService,
  ITranslation,
  ICounts,
  IDataCounts,
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

  public characterCount1: number = 0;
  public wordCount1: number = 0;
  public lineCount1: number = 0;

  constructor(private translationService: TranslateService) {}

  public onPageFetchClicked(): void {
    const selector = !this.disableSelector ? this.selector : "";
    this.translationService
      .pageFetch(this.url, selector)
      .subscribe((data: IDataCounts) => {
        this.textOriginal = _.get(data, "data");
        const counts: ICounts = _.get(data, "counts");
        if (!_.isNil(counts)) {
          this.characterCount = counts.characterCount;
          this.wordCount = counts.wordCount;
          this.lineCount = counts.lineCount;
        }
      });
  }

  public onTranslateClicked(): void {
    if (_.isNil(this.textOriginal)) {
      return;
    }

    this.translationService
      .translate(this.textOriginal)
      .subscribe((data: IDataCounts) => {
        this.textTranslated = _.get(data, "data");
        const counts: ICounts = _.get(data, "counts");
        if (!_.isNil(counts)) {
          this.characterCount1 = counts.characterCount;
          this.wordCount1 = counts.wordCount;
          this.lineCount1 = counts.lineCount;
        }
      });
  }
}
