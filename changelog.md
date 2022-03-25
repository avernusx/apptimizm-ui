## 0.1.36
- исправить баг с отмечанием выбранных пунктов в MultipleRelationSelect
- добавить props clearable в RelationSelect, MultipleRelationSelect
## 0.1.35
- изменена сборка стилей
## 0.1.34
- Старый PaginationElement - добавлены классы apptimizm-ui-pagination-page и active при пажинации ссылками
## 0.1.33
- PaginationElement - добавлены классы apptimizm-ui-pagination-page и active при пажинации ссылками
## 0.1.32
- добавлена composable-функция useAxios для получения настроенного инстанса axios в проекте
- добавлено всплывающее окно AutomaticErrorPopup для отображения ошибок запроса при использовании useAxios
## 0.1.31
- DefaultTable - удалять элемент из выбранных элементов при его удалении из таблицы
- DefaultTable, RelationSelect, MultipleRelationSelect, EnumSelect - добавлена возможность пробрасывать в params / defaultFilter массив строк для запроса на бек в формате param1[]=1&param1[]=2
- RelationSelect, MultipleRelationSelect, EnumSelect - добавлен props preselected для автоматического выбора первого элемента при отрисовке компонента
- DefaultTable, RelationSelect, MultipleRelationSelect - добавлены параметры requestPageKey и requestPerPageKey, отвечающие за подмену ключей page и per_page на кастомные значения при запросе на бекенд
- PaginationElement - исправить баг, когда смена страницы через поле ввода изменяла так же и количество элементов на странице
- MultipleRelationSelect - добавить props showChips для отображения выбранных элементов
## 0.1.30:
- usePaginatedApi - исправлен баг со сбросом номера текущей страницы к 0 вместо 1 при вызове reload