define(['backbone-postmaster'], function (Postmaster) {
  describe("modularrouter", function () {
    var router;
    beforeEach(function () {
      router = new Postmaster();
      spyOn(router._backboneRouter, "route");
    });

    it("register a simple named function correctly", function () {
      var func = function () {};
      var routeName = "testRoute";
      router.register(routeName, routeName, func);
      expect(router._backboneRouter.route).toHaveBeenCalledWith(routeName, routeName, func);
    });

    it("register a simple unnamed function correctly", function () {
      var func = function () {};
      var routeName = "testRoute";
      router.register(routeName, func);
      expect(router._backboneRouter.route).toHaveBeenCalledWith(routeName, routeName, func);
    });

    it("register a simple empty-path function correctly", function () {
      var func = function () {};
      var routePath = "";
      var routeName = "home";
      try {
        router.register(routePath, func);
      } catch (err) {
        expect(err).toEqual("Name argument is required if route is \"\"");
      }
      expect(router._backboneRouter.route).not.toHaveBeenCalled();

      router.register(routePath, routeName, func);
      expect(router._backboneRouter.route).toHaveBeenCalledWith(routePath, routeName, func);
    });

    it("registers a named controller object with multiple subviews", function () {
      var controller = {
        route1Func: function () { console.log("Route 1"); },
        route2Func: function () { console.log("Route 2"); },
        routes: {
          "route1":"route1Func",
          "route2":"route2Func"
        }
      };
      var controllerName = "controller";
      var controllerPath = "controllerpath";
      router.register(controllerPath, controllerName, controller);

      expect(router._backboneRouter.route.calls.count()).toEqual(2);

      var route1 = router._backboneRouter.route.calls.argsFor(0);
      
      expect(route1[0]).toEqual(controllerPath+"/route1");
      expect(route1[1]).toEqual(controllerName+"_route1Func");
      
      var route2 = router._backboneRouter.route.calls.argsFor(1);
      expect(route2[0]).toEqual(controllerPath+"/route2");
      expect(route2[1]).toEqual(controllerName+"_route2Func");
      
      router.register(controllerPath, controller);

      expect(router._backboneRouter.route.calls.count()).toEqual(4);

      var route1 = router._backboneRouter.route.calls.argsFor(2);
      expect(route1[0]).toEqual(controllerPath+"/route1");
      expect(route1[1]).toEqual(controllerPath+"_route1Func");

      var route2 = router._backboneRouter.route.calls.argsFor(3);
      expect(route2[0]).toEqual(controllerPath+"/route2");
      expect(route2[1]).toEqual(controllerPath+"_route2Func");

    });

  });
});
