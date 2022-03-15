
## 0.1.31
- DefaultTable - удалять элемент из выбранных элементов при его удалении из таблицы
- DefaultTable, RelationSelect, MultipleRelationSelect, EnumSelect - добавлена возможность пробрасывать в params / defaultFilter массив строк для запроса на бек в формате param1[]=1&param1[]=2
- RelationSelect, MultipleRelationSelect, EnumSelect - добавить props preselected для автоматического выбора первого элемента при отрисовке компонента
## 0.1.30:
- usePaginatedApi - исправлен баг со сбросом номера текущей страницы к 0 вместо 1 при вызове reload