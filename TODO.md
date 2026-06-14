# TODO

- [ ] استبدال `Promise<any>` في `src/services/projectService.ts` بأنواع مناسبة (بدون `any`) للدوال: `deleteProject`, `updateProject`, `createProject`, وربما `gradeProjectSubmission`.
- [ ] إضافة types عامة لردود الـ API (مثل `{ message?: string } | unknown`).
- [ ] تشغيل ESLint/TypeScript build للتحقق من اختفاء warning.
