// (C) Copyright 2015 Martin Dougiamas
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

angular.module('mm', ['ionic', 'mm.core', 'ngCordova'])
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

angular.module('mm.core', ['pascalprecht.translate']);

angular.module('mm.core')
.factory('$mmLang', function($translate, $translatePartialLoader, $mmConfig) {
    var self = {};
        self.registerLanguageFolder = function(path) {
        $translatePartialLoader.addPart(path);
    }
    self.changeCurrentLanguage = function(language) {
        $translate.use(language);
        $mmConfig.set('current_language', language);
    }
    return self;
})
.config(function($translateProvider, $translatePartialLoaderProvider) {
    $translateProvider.useLoader('$translatePartialLoader', {
      urlTemplate: '{part}/{lang}.json'
    });
    $translatePartialLoaderProvider.addPart('build/lang');
    $translateProvider.fallbackLanguage('en');
})
.run(function($ionicPlatform, $translate, $cordovaGlobalization, $mmConfig) {
    $ionicPlatform.ready(function() {
        $mmConfig.get('current_language').then(function(language) {
            $translate.use(language);
        }, function() {
            $cordovaGlobalization.getPreferredLanguage().then(function(result) {
                var language = result.value;
                if (language.indexOf('-') > -1) {
                    language = language.substr(0, language.indexOf('-'));
                }
                $translate.use(language);
            }, function() {
                $translate.use('en');
            });
        });
    });
});