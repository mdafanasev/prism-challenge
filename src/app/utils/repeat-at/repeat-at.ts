import { merge, Observable, of, switchMap, timer } from 'rxjs';

// Custom RxJs operator to schedule repeat of Observable at some timestamp 
export function repeatAt<T>(
  accessor: (value: T) => Date
): (source: Observable<T>) => Observable<T> {
  return (source) =>
    source.pipe(
      switchMap((value) => {
        const diff = Number(accessor(value)) - Number(new Date());
        return merge(
          of(value),
          timer(diff).pipe(
            switchMap(() => source),
            repeatAt(accessor)
          )
        );
      })
    );
}
