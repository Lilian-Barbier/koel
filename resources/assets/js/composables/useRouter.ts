import { RouterKey } from '@/symbols'
import Router from '@/router'
import { requireInjection } from '@/utils/helpers'

let router: Router

export const useRouter = () => {
  router = router || requireInjection(RouterKey)

  const getRouteParam = <T = string> (name: string) => router.$currentRoute.value?.params?.[name] as T
  const getCurrentScreen = () => router.$currentRoute.value?.screen
  const isCurrentScreen = (...screens: ScreenName[]) => screens.includes(router.$currentRoute.value?.screen)
  const getRouteName = () => router.$currentRoute.value?.name
  const isCurrentRoute = (routeName: string) => routeName === router.$currentRoute.value?.name

  const onScreenActivated = (screen: ScreenName, cb: Closure) => {
    isCurrentScreen(screen) && cb()
    router.onRouteChanged(route => route.screen === screen && cb())
  }

  return {
    getRouteParam,
    getCurrentScreen,
    getRouteName,
    isCurrentRoute,
    isCurrentScreen,
    onScreenActivated,
    go: Router.go,
    onRouteChanged: router.onRouteChanged.bind(router),
    resolveRoute: router.resolve.bind(router),
    triggerNotFound: router.triggerNotFound.bind(router),
    url: Router.url,
  }
}
