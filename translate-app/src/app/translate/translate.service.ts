import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export interface ICounts {
  characterCount: number;
  wordCount: number;
  lineCount: number;
}

export interface IDataCounts {
  data: string;
  counts: ICounts;
}

export interface ITranslation {
  original: IDataCounts;
  translation: IDataCounts;
}

@Injectable({
  providedIn: "root",
})
export class TranslateService {
  constructor(private http: HttpClient) {}

  public pageFetch(url: string, selector: string): Observable<IDataCounts> {
    return this.http.get<IDataCounts>("api/page_fetch", {
      params: {
        url,
        selector,
      },
    });
  }

  public translate(text: string): Observable<IDataCounts> {
    return this.http.post<IDataCounts>("api/translate", {
      params: {
        text,
      },
    });
  }
}
