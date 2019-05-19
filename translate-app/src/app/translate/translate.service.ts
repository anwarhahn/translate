import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export interface ICounts {
  characterCount: number;
  wordCount: number;
  lineCount: number;
}

export interface ITranslation {
  original: {
    data: string;
    counts: ICounts;
  };
  translation: {
    data: string;
    counts: ICounts;
  };
}

@Injectable({
  providedIn: "root",
})
export class TranslateService {
  constructor(private http: HttpClient) {}

  public translate(url: string, selector: string): Observable<any> {
    return this.http.get("api/translate", {
      params: {
        url,
        selector,
      },
    });
  }
}
