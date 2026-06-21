/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(admin)` | `/(admin)/chat` | `/(admin)/dashboard` | `/(admin)/notices` | `/(admin)/posts` | `/(admin)/profile` | `/(admin)/requests` | `/(auth)/landing` | `/(auth)/login` | `/(auth)/register/admin-step1` | `/(auth)/register/admin-step2` | `/(auth)/register/admin-step3` | `/(auth)/register/parent-step1` | `/(auth)/register/parent-step2` | `/(auth)/register/parent-step3` | `/(auth)/register/school-select` | `/(auth)/register/teacher-step1` | `/(auth)/register/teacher-step2` | `/(parent)` | `/(parent)/chat` | `/(parent)/dashboard` | `/(parent)/posts` | `/(parent)/profile` | `/(teacher)` | `/(teacher)/chat` | `/(teacher)/dashboard` | `/(teacher)/posts` | `/(teacher)/profile` | `/_sitemap` | `/chat` | `/dashboard` | `/landing` | `/login` | `/notices` | `/posts` | `/profile` | `/register/admin-step1` | `/register/admin-step2` | `/register/admin-step3` | `/register/parent-step1` | `/register/parent-step2` | `/register/parent-step3` | `/register/school-select` | `/register/teacher-step1` | `/register/teacher-step2` | `/requests`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
