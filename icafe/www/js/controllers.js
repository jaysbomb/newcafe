angular.module('starter.controllers', [])

// <script src="https://cdn.firebase.com/js/client/2.2.4/firebase.js"></script>
// <script src="https://cdn.firebase.com/libs/angularfire/1.1.3/angularfire.min.js"></script>

.controller('AppCtrl', function($scope, $http, $ionicModal, $timeout,
  localStorageService, ngProgressLite, $state, $cordovaBarcodeScanner) {
  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.user = localStorageService.get('user');
    $http.get("http://https://icafe-a.herokuapp.com/getAdmin/admin@admin.com")
        .then(function(response){
          // console.log(response.data.table);
          $scope.tableNumber = response.data.table;
        })
    $scope.openSub = function(name) {
      $scope.submenu = true;
      $scope.selection = 'sub';
    }
    $scope.openSub2 = function(name) {
      $scope.submenu = true;
      $scope.selection = 'sub2';
    }
    $scope.backToMain = function() {
      $scope.submenu = false;
      $scope.selection = 'main';
    }
    
    if($scope.user != null){
      $scope.goLogin = "Logout";
      $scope.loginOrNot = false;
      if($scope.user.isAdmin && $scope.user.isAdmin == true){
        $scope.showAdmin = true;
      }else{
        $scope.showAdmin = false;
      }
      $http.get("https://icafe-a.herokuapp.com/getUserCart/" + $scope.user._id )
        .then(function(response){
          // console.log(response.data.length);
          $scope.cartNumber = response.data.length; 
        })

      console.log($scope.user.frequency);
      if($scope.user.frequency > 5){
        $scope.isVIP = true;
        localStorage.setItem("vip",0);
      }else{
        $scope.isVIP = false;
      }

    }else{
      $scope.loginOrNot = true;
      $scope.goLogin = "Go Login";
       $http.get("https://icafe-a.herokuapp.com/getAdmin/admin@admin.com")
        .then(function(response){
          console.log(response.data.table);
          $scope.tableNumber = response.data.table;
          $http.get("https://icafe-a.herokuapp.com/getTableCart/" + $scope.tableNumber )
          .then(function(response){
            console.log(response.data.length);
            $scope.cartNumber = response.data.length; 
          })
        })
      
    } // end of if user exist
    
  });

  $scope.goToCart = function(){
    $state.go('app.cart');
  }
  $scope.goToLogin = function(){
    $state.go('login');
  }
})
  .controller('LogoutCtrl', function($scope, $http, Base_Url, $state, localStorageService) {
    $scope.$on('$ionicView.beforeEnter', function() {
      localStorageService.clearAll();
      $state.go('login');
    });
  })

.controller('LoginCtrl', function($ionicPopup, $scope, $state, $http, Base_Url, $ionicModal, localStorageService, $cordovaOauth) {
  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.user = localStorageService.get('user');
    if ($scope.user) {
      $state.go('app.recommend');
    }
  });

  $scope.orderwithoutaccount = function(){
    $state.go('app.recommend');
  }

  $scope.doLogin = function(user) {
    $http.post(Base_Url + "/login", user)
      .then(function(response) {
        // console.log(response);
        if (response.data.status == 401) {
          var alertPopup = $ionicPopup.alert({
            title: 'icafe',
            template: 'Email or Password Wrong!'
          });
        } else {
          localStorageService.set('user', response.data.user);
          $http.put(Base_Url + "/updateFrequency/" + response.data.user._id, 
            { frequency: response.data.user.frequency + 1 }).then(function(response) {
            // console.log(response);
          });
          $state.go('app.recommend');
        }
      });
  }
})

.controller('SignupCtrl', function($ionicPopup, $ionicModal, $scope, $state, $http, Base_Url, localStorageService) {
  $scope.doSignup = function(user) {
    if(user.password == user.password_confirmation){
      $http.post(Base_Url + "/signup", user)
        .then(function(response) {
        if (response.data.success == true) {
        localStorageService.set('user', response.data.user);
        $state.go('app.recommend')
        }else{
          console.log(response);
        }
      });
    }else{
      var alertPopup = $ionicPopup.alert({
      title: 'icafe',
      template: 'Two passwords are not the same!'
      });
    }
  }
})

.controller('CartCtrl', function($scope, $state, $http, Base_Url, localStorageService, $cordovaBarcodeScanner,$ionicPopup) {
     $scope.$on('$ionicView.beforeEnter', function() {
      $scope.user = localStorageService.get('user');
      if($scope.user){
        $http.get(Base_Url + "/getUserCart/" + $scope.user._id)
        .then(function(response) {
          $scope.currentUserCart = response.data;
          $scope.cartItems = [];
          $scope.cartItemsAmount = [];
          $scope.cartItemsId = [];
          $scope.totalPrice = 0;
          
          for(var i = 0; i < $scope.currentUserCart.length; i++){
            $scope.cartItemsAmount.push($scope.currentUserCart[i].amount);
            $scope.cartItemsId.push($scope.currentUserCart[i]);
            $http.get(Base_Url + "/getDishById/" + $scope.currentUserCart[i].dish )
            .then(function(response) {
              for(var i = 0; i < $scope.currentUserCart.length; i++){
                // console.log($scope.currentUserCart[i]);
                var price = response.data[0].price * $scope.currentUserCart[i].amount;
                $scope.totalPrice += Math.floor(price / $scope.currentUserCart.length);
                if($scope.user.frequency > 5){
                  $scope.isVIP = true;
                  $scope.totalPrice = $scope.totalPrice * 0.8;
                }
              } 
              console.log(response.data[0].price);
              $scope.cartItems.push(response.data[0]);
              console.log($scope.cartItems);
            });
          }
        });
      }else{
        $http.get("https://icafe-a.herokuapp.com/getAdmin/admin@admin.com")
        .then(function(response){
          console.log(response.data.table);
          $scope.tableNumber = response.data.table;
          $http.get(Base_Url + "/getTableCart/" + $scope.tableNumber)
          .then(function(response) {
            $scope.currentUserCart = response.data;
            $scope.cartItems = [];
            $scope.cartItemsAmount = [];
            $scope.cartItemsId = [];
            $scope.totalPrice = 0;
            for(var i = 0; i < $scope.currentUserCart.length; i++){
              $scope.cartItemsAmount.push($scope.currentUserCart[i].amount);
              $scope.cartItemsId.push($scope.currentUserCart[i]);
              $http.get(Base_Url + "/getDishById/" + $scope.currentUserCart[i].dish )
              .then(function(response) {
                for(var i = 0; i < $scope.currentUserCart.length; i++){
                  // console.log($scope.currentUserCart[i]);
                  var price = response.data[0].price * $scope.currentUserCart[i].amount;
                  $scope.totalPrice += Math.floor(price / $scope.currentUserCart.length);
                } 
                console.log(response.data[0].price);
                $scope.cartItems.push(response.data[0]);
                console.log($scope.cartItems)
              });
            }
          });
        })    
      }
      
      
    });

    $scope.closeAddModal = function() {
          setTimeout(function(){
            location.reload();
          },2500);
    };

    $scope.addOne = function(dish){
      console.log(dish)
      if($scope.user){
        var cartdish_post = {
          'user': $scope.user._id,
          'dish': dish.dish,
          'amount': 1,
        }
      }else{
        var cartdish_post = {
          'table': $scope.tableNumber,
          'dish': dish.dish,
          'amount': 1,
        }
      }
      
      $http.post(Base_Url + '/addCartdish', cartdish_post)
        .then(function(response){
            var alertPopup = $ionicPopup.alert({
            title: 'Icafe',
            template: 'Add successfully!'
            });
            $scope.closeAddModal();            
        })
    }

    $scope.minusOne = function(dish){
      if($scope.user){
        var cartdish_post = {
        'user': $scope.user._id,
        'dish': dish.dish,
        'id': dish._id,
        'amount': 1,
      }
      }else{
        var cartdish_post = {
          'table': $scope.tableNumber,
          'dish': dish.dish,
          'id': dish._id,
          'amount': 1,
        }
      }
      
      $http.post(Base_Url + '/minusCartdish', cartdish_post)
        .then(function(response){
            var alertPopup = $ionicPopup.alert({
            title: 'Icafe',
            template: 'Update successfully!'
            });
            $scope.closeAddModal();            
        })
    }

    $scope.clearCart = function(){
      if($scope.user){
        $http.delete(Base_Url + '/clearUserCart/' + $scope.user._id)
        .then(function(response){
            var alertPopup = $ionicPopup.alert({
            title: 'Icafe',
            template: 'Clear successfully!'
            });
            $scope.closeAddModal();            
        })
      }else{
        $http.delete(Base_Url + '/clearTableCart/' + $scope.tableNumber)
        .then(function(response){
            var alertPopup = $ionicPopup.alert({
            title: 'Icafe',
            template: 'Clear successfully!'
            });
            $scope.closeAddModal();            
        })
      }
    }

    $scope.goCheck = function(){
        $state.go('app.pay');
    }
})

.controller('RecommendCtrl', function($scope, $state, $http, Base_Url, localStorageService, $cordovaBarcodeScanner,$ionicPopup) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $http.get(Base_Url + "/getRecommendedDishes")
        .then(function(response) {
          console.log(response);
          $scope.recommendlist = response.data;
        });
    });

    $scope.closeAddModal = function() {
      setTimeout(function(){
        location.reload();
      },2500);
    };

    $scope.addtocart = function(dish){
      console.log(dish);
      // console.log($scope.user._id)
      if($scope.user){
        var cartdish_post = {
          'table': $scope.tableNumber,
          'user': $scope.user._id,
          'dish': dish._id,
          'amount': 1,
        }
      }else{
        var cartdish_post = {
          'table': $scope.tableNumber,
          'dish': dish._id,
          'amount': 1,
        }
      }

      $http.post(Base_Url + '/addCartdish', cartdish_post)
        .then(function(response){
            var alertPopup = $ionicPopup.alert({
            title: 'Icafe',
            template: 'Add successfully!'
            });
            $scope.closeAddModal();            
        })
    }
})

.controller('SaladCtrl', function($scope, $state, $http, Base_Url, localStorageService, $cordovaBarcodeScanner,$ionicPopup,$timeout) {
    $scope.$on('$ionicView.beforeEnter', function() {     
      $http.get(Base_Url + "/getSalad")
        .then(function(response) {
          console.log(response);
          $scope.saladlist = response.data;
        });
    });
})

.controller('StapleCtrl', function($scope, $state, $http, Base_Url, localStorageService, $cordovaBarcodeScanner,$ionicPopup) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $http.get(Base_Url + "/getStaple")
        .then(function(response) {
          console.log(response);
          $scope.staplelist = response.data;
        });
    }); 

    $scope.triggerfontchange = function(){

    }
})

.controller('DessertCtrl', function($scope, $state, $http, Base_Url, localStorageService, $cordovaBarcodeScanner,$ionicPopup) {
    $scope.$on('$ionicView.beforeEnter', function() {
      var date = new Date();
      var hour = date.getHours();
      if(hour >= 0 && hour <= 9){
        $http.get(Base_Url + "/getDessertBreakfast")
          .then(function(response) {
            console.log(response);
            $scope.dessertlist = response.data;
        });
        console.log("breakfast")
      }else if(hour > 9 && hour <= 14){
        $http.get(Base_Url + "/getDessertLunch")
          .then(function(response) {
            console.log(response);
            $scope.dessertlist = response.data;
        });
        console.log("lunch")
      }else{
        $http.get(Base_Url + "/getDessertSupper")
          .then(function(response) {
            console.log(response);
            $scope.dessertlist = response.data;
        });
        console.log("supper")
      } 
    });

    // setTimeout(function(){
     //    location.reload();
    // },10000);

    $scope.closeAddModal = function() {
      setTimeout(function(){
        location.reload();
      },2500);
    };
    $scope.$on('$destroy', function() {
      $scope.modaladd.remove();
    });

    $scope.addToCart = function(dish){
      console.log(dish);
      if($scope.user){
        var cartdish_post = {
          'user': $scope.user._id,
          'dish': dish._id,
          'amount': 1,
        }
      }else{
        var cartdish_post = {
          'table': $scope.tableNumber,
          'dish': dish._id,
          'amount': 1,
        }
      }

      $http.post(Base_Url + '/addCartdish', cartdish_post)
        .then(function(response){
            var alertPopup = $ionicPopup.alert({
            title: 'Icafe',
            template: 'Add successfully!'
            });
            $scope.closeAddModal();            
        })
    }
    
    $scope.fontdontchange = false;
    $scope.fontchange = true;
    $scope.triggerfontchange = function(){
      $scope.fontdontchange = !$scope.fontdontchange;
      $scope.fontchange = !$scope.fontchange;
    }
  
})

.controller('DrinkCtrl', function($scope, $state, $http, Base_Url, localStorageService, $cordovaBarcodeScanner,$ionicPopup) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $http.get(Base_Url + "/getDrink")
        .then(function(response) {
          console.log(response);
          $scope.drinklist = response.data;
        });
    }); 
})

.controller('SoupCtrl', function($scope, $state, $http, Base_Url, localStorageService, $cordovaBarcodeScanner,$ionicPopup) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $http.get(Base_Url + "/getSoup")
        .then(function(response) {
          console.log(response);
          $scope.souplist = response.data;
        });
    });
})

.controller('SnackCtrl', function($scope, $state, $http, Base_Url, localStorageService, $cordovaBarcodeScanner,$ionicPopup) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $http.get(Base_Url + "/getSnack")
        .then(function(response) {
          console.log(response);
          $scope.snacklist = response.data;
        });
    }); 
})

.controller('SetmealCtrl', function($scope, $state, $http, Base_Url, localStorageService, $cordovaBarcodeScanner,$ionicPopup) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $http.get(Base_Url + "/getSetMeal")
        .then(function(response) {
          console.log(response.data);
          $scope.setmeals = response.data;
        });
    });

    $scope.closeAddModal = function() {
      setTimeout(function(){
        location.reload();
      },2500);
    };
    $scope.$on('$destroy', function() {
      $scope.modaladd.remove();
    });

    $scope.addToCart = function(dish){
      console.log(dish);
      if($scope.user){
        var cartdish_post = {
          'user': $scope.user._id,
          'dish': dish._id,
          'amount': 1,
        }
      }else{
        var cartdish_post = {
          'table': $scope.tableNumber,
          'dish': dish._id,
          'amount': 1,
        }
      }

      $http.post(Base_Url + '/addCartdish', cartdish_post)
        .then(function(response){
            var alertPopup = $ionicPopup.alert({
            title: 'Icafe',
            template: 'Add successfully!'
            });
            $scope.closeAddModal();            
        })
    }

    $scope.fontdontchange = false;
    $scope.fontchange = true;
    $scope.triggerfontchange = function(){
      $scope.fontdontchange = !$scope.fontdontchange;
      $scope.fontchange = !$scope.fontchange;
    }
})

.controller('DishesCtrl', function($scope, $state, $http, Base_Url, localStorageService,$ionicModal,$ionicPopup) {
    $scope.$on('$ionicView.beforeEnter',function(){ 
      $http.get(Base_Url + "/getAllDishes")
      .then(function(response){
        console.log(response["data"]);
        $scope.all_dishes = response["data"];
      })

      $http.get(Base_Url + "/getDessert")
      .then(function(response){
        console.log(response["data"]);
        var names = [];
        for(var i = 0; i < response["data"].length; i++){
          names.push(response["data"][i].name);
        }
        $scope.desserts = names;
      })

      $http.get(Base_Url + "/getStaple")
      .then(function(response){
        console.log(response["data"]);
        var names = [];
        for(var i = 0; i < response["data"].length; i++){
          names.push(response["data"][i].name);
        }
        $scope.staples = names;
      }) 

      $http.get(Base_Url + "/getDrink")
      .then(function(response){
        console.log(response["data"]);
        var names = [];
        for(var i = 0; i < response["data"].length; i++){
          names.push(response["data"][i].name);
        }
        $scope.drinks = names;
      })     

    });



    $ionicModal.fromTemplateUrl('templates/addsetdish.html',{scope: $scope,animation: 'slide-in-up'})
      .then(function(modalsetmeal) {
        $scope.modalsetmeal = modalsetmeal;
    });

    $scope.openSetMealModal = function() {
      $scope.modalsetmeal.show();
    };
    $scope.closeSetMealModal = function() {
      $scope.modalsetmeal.hide();
      setTimeout(function(){
        location.reload();
      },2500);
    };
    $scope.$on('$destroy', function() {
      $scope.modalsetmeal.remove();
    });



    $ionicModal.fromTemplateUrl('templates/settablenumber.html',{scope: $scope,animation: 'slide-in-up'})
      .then(function(modalsettablenumber) {
        $scope.modalsettablenumber = modalsettablenumber;
    });

    $scope.openSetTableModal = function() {
      $scope.modalsettablenumber.show();
    };
    $scope.closeSetTableModal = function() {
      $scope.modalsettablenumber.hide();
      setTimeout(function(){
        location.reload();
      },2500);
    };
    $scope.$on('$destroy', function() {
      $scope.modalsettablenumber.remove();
    });

    $scope.settablenumber = function(tablenumber){
      console.log(tablenumber);
      $http.put(Base_Url + "/setTableNumber/admin@admin.com", { table: tablenumber }).then(function(response) {
        console.log(response);
      });
      $scope.closeSetTableModal();
    }

    $ionicModal.fromTemplateUrl('templates/addsetdish.html',{scope: $scope,animation: 'slide-in-up'})
      .then(function(modaladdsetdish) {
        $scope.modaladdsetdish = modaladdsetdish;
    });

    $scope.openAddModal = function() {
      $scope.modaladdsetdish.show();
    };
    $scope.closeAddModal = function() {
      $scope.modaladdsetdish.hide();
      setTimeout(function(){
        location.reload();
      },2500);
    };
    $scope.$on('$destroy', function() {
      $scope.modaladdsetdish.remove();
    });

    $ionicModal.fromTemplateUrl('templates/editdish.html', {
    scope: $scope,
    animation: 'slide-in-up'
    }).then(function(modaledit) {
      $scope.modaledit = modaledit;
    });

    $scope.openEditModal = function(dish) {
      $scope.current_dish = dish;
      $scope.modaledit.show();
    };
    $scope.closeEditModal = function() {
      $scope.modaledit.hide();
      setTimeout(function(){
        location.reload();
      },2500);
    };
    $scope.$on('$destroy', function() {
      $scope.modaledit.remove();
    });

    
    $ionicModal.fromTemplateUrl('templates/adddish.html',{scope: $scope,animation: 'slide-in-up'})
      .then(function(modaladd) {
        $scope.modaladd = modaladd;
    });

    $scope.openAddModal = function() {
      $scope.modaladd.show();
    };
    $scope.closeAddModal = function() {
      $scope.modaladd.hide();
      setTimeout(function(){
        location.reload();
      },2500);
    };
    $scope.$on('$destroy', function() {
      $scope.modaladd.remove();
    });

    $scope.updatedish = function(dish_name,dish_price,dish_description,dish_category,dish_period){
        var dish_update = {
        'name': dish_name,
        'price': dish_price,
        'description': dish_description,
        'category': dish_category,
        'period': dish_period,
      }
      $http.post(Base_Url + "/updateDish/" + $scope.current_dish._id, dish_update)
        .then(function(response){
          if(response.data.status == 500){
            var alertPopup = $ionicPopup.alert({
            title: 'Icafe',
            template: 'No dish found!'
            });
            $scope.closeEditModal();
          }else{
            var alertPopup = $ionicPopup.alert({
            title: 'Icafe',
            template: 'Update successfully!'
            });
            $scope.closeEditModal();
          }
      });
    }

    $scope.adddish = function(dish_name,dish_price,dish_description,dish_category,dish_period){
      dish_price = parseInt(dish_price, 10);
      console.log(dish_name,dish_price,dish_description,dish_category);
      var dish_post = {
        'name': dish_name,
        'price': dish_price,
        'description': dish_description,
        'category': dish_category,
        'period': dish_period,
      }

      $http.post(Base_Url + '/addDish', dish_post)
        .then(function(response){
          if(response.data.status == 500){
            var alertPopup = $ionicPopup.alert({
              title: 'Icafe',
              template: 'You have already added this dish!'
              });
              $scope.closeAddModal();
          }else{
              var alertPopup = $ionicPopup.alert({
              title: 'Icafe',
              template: 'Add successfully!'
              });
              $scope.closeAddModal();            
            }
        })
    }

    $scope.addtorecommend = function(){
        $http.put(Base_Url + "/addDishToRecommend/" + $scope.current_dish._id)
        .then(function(response){
          if(response.data.status == 500){
            var alertPopup = $ionicPopup.alert({
            title: 'Icafe',
            template: 'Already added!'
            });
            $scope.closeEditModal();
          }else{
            var alertPopup = $ionicPopup.alert({
            title: 'Icafe',
            template: 'Added successfully!'
            });
            $scope.closeEditModal();
          }
        });
    }    

    $scope.deletedish = function(){
      $http.delete(Base_Url + "/deleteDish/" + $scope.current_dish._id)
        .then(function(response){
          if(response.data.status == 500){
            var alertPopup = $ionicPopup.alert({
            title: 'Icafe',
            template: 'No dish found!'
            });
            $scope.closeEditModal();
          }else{
            var alertPopup = $ionicPopup.alert({
            title: 'Icafe',
            template: 'Delete successfully!'
            });
            $scope.closeEditModal();
          }
        });
    }

    $scope.categories = ['Salad','Staple','Dessert','Drink','Soup','Snack'];
    $scope.periods = ['Breakfast','Lunch','Supper'];

    $scope.addsetmeal = function(setmeal_name,setmeal_price,setmeal_description,dish_period,staple_choice,drink_choice,dessert_choice){
      var setmealcontent = [];
      setmealcontent.push(staple_choice);
      setmealcontent.push(drink_choice);
      setmealcontent.push(dessert_choice);
      console.log(setmealcontent);
      console.log(setmeal_name,setmeal_price,setmeal_description,dish_period,staple_choice,drink_choice,dessert_choice);
      var setmeal_post = {
        'name': setmeal_name,
        'price':  parseInt(setmeal_price, 10),
        'description': setmeal_description,
        'category': "SetMeal",
        'period': dish_period,
        'dishcontent':setmealcontent,
      }

      $http.post(Base_Url + '/addDish', setmeal_post)
        .then(function(response){
          if(response.data.status == 500){
            var alertPopup = $ionicPopup.alert({
              title: 'Icafe',
              template: 'You have already added this dish!'
              });
              $scope.closeAddModal();
          }else{
              var alertPopup = $ionicPopup.alert({
              title: 'Icafe',
              template: 'Add successfully!'
              });
              $scope.closeAddModal();            
            }
        })

    }

})

.controller('UsersCtrl', function($scope, $state, $http, Base_Url, localStorageService, $cordovaBarcodeScanner,$ionicPopup) {
    $scope.$on('$ionicView.beforeEnter',function(){ 
      $http.get(Base_Url + "/getAllUsers")
      .then(function(response){
        console.log(response["data"]);
        $scope.all_users = response["data"];
      })
    });

    $scope.deleteuser = function(user) {
     var confirmPopup = $ionicPopup.confirm({
       template: 'Are you sure you want to delete this user?'
     });
     confirmPopup.then(function(res) {
       if(res) {
         $http.delete(Base_Url + "/deleteUser/" + user._id)
          .then(function(response){
            var alertPopup = $ionicPopup.alert({
            title: 'Icafe',
            template: 'User Deleted successfully!'
            });
        });
        setTimeout(function(){
          location.reload();
        },2500);
       } else {
         console.log('close modal');
       }
     });
   };
})

.controller('PayCtrl', function($scope, $state, $http, Base_Url, localStorageService, $cordovaBarcodeScanner,$ionicPopup) {
    $scope.$on('$ionicView.beforeEnter', function() {
      $scope.user = localStorageService.get('user');
      if($scope.user){
        $http.get(Base_Url + "/getUserCart/" + $scope.user._id)
        .then(function(response) {
          $scope.currentUserCart = response.data;
          $scope.cartItems = [];
          $scope.cartItemsAmount = [];
          $scope.cartItemsId = [];
          $scope.totalPrice = 0;
          for(var i = 0; i < $scope.currentUserCart.length; i++){
            $scope.cartItemsAmount.push($scope.currentUserCart[i].amount);
            localStorage.setItem("cartItemsAmount",$scope.cartItemsAmount);
            $scope.cartItemsId.push($scope.currentUserCart[i]);
            $http.get(Base_Url + "/getDishById/" + $scope.currentUserCart[i].dish )
            .then(function(response) {
              for(var i = 0; i < $scope.currentUserCart.length; i++){
                // console.log($scope.currentUserCart[i]);
                var price = response.data[0].price * $scope.currentUserCart[i].amount;
                $scope.totalPrice += Math.floor(price / $scope.currentUserCart.length);
                if($scope.user.frequency > 5){
                  $scope.isVIP = true;
                  $scope.totalPrice = $scope.totalPrice * 0.8;
                }
              } 
              // console.log(response.data[0].price);
              $scope.cartItems.push(response.data[0]);
              localStorage.setItem("cartItems",$scope.cartItems);
              // console.log($scope.cartItems)
            });
          }
        });
      }else{
        $http.get("https://icafe-a.herokuapp.com/getAdmin/admin@admin.com")
        .then(function(response){
          console.log(response.data.table);
          $scope.tableNumber = response.data.table;
          $http.get(Base_Url + "/getTableCart/" + $scope.tableNumber)
          .then(function(response) {
            $scope.currentUserCart = response.data;
            $scope.cartItems = [];
            $scope.cartItemsAmount = [];
            $scope.cartItemsId = [];
            $scope.totalPrice = 0;
            for(var i = 0; i < $scope.currentUserCart.length; i++){
              $scope.cartItemsAmount.push($scope.currentUserCart[i].amount);
              $scope.cartItemsId.push($scope.currentUserCart[i]);
              $http.get(Base_Url + "/getDishById/" + $scope.currentUserCart[i].dish )
              .then(function(response) {
                for(var i = 0; i < $scope.currentUserCart.length; i++){
                  // console.log($scope.currentUserCart[i]);
                  var price = response.data[0].price * $scope.currentUserCart[i].amount;
                  $scope.totalPrice += Math.floor(price / $scope.currentUserCart.length);
                } 
                console.log(response.data[0].price);
                $scope.cartItems.push(response.data[0]);
                console.log($scope.cartItems)
              });
            }
          });
        }) 
      }
        if($scope.user){
          // console.log($scope.user)
          $scope.username = $scope.user.name;
          $scope.useremail = $scope.user.email;
          $scope.tablenumber = $scope.tableNumber;
        }else{
          $scope.username = "User not loggedin";
          $scope.useremail = "User not loggedin";
          $http.get("https://icafe-a.herokuapp.com/getAdmin/admin@admin.com")
          .then(function(response){
            // console.log(response.data.table);
            $scope.tableNumber = response.data.table;
            $scope.tablenumber = $scope.tableNumber;
          })   
        }
    }); // end of before enter

    $scope.generateOrder = function(cardnumber,cardname){
      $scope.user = localStorageService.get('user');
      if($scope.user){
        $http.get(Base_Url + "/getUserCart/" + $scope.user._id)
        .then(function(response) {
          $scope.currentUserCart = response.data;
          $scope.cartItems = [];
          $scope.cartItemsAmount = [];
          $scope.cartItemsId = [];
          $scope.totalPrice = 0;
          for(var i = 0; i < $scope.currentUserCart.length; i++){
            $scope.cartItemsAmount.push($scope.currentUserCart[i].amount);
            localStorage.setItem("cartItemsAmount",$scope.cartItemsAmount);
            $scope.cartItemsId.push($scope.currentUserCart[i]);
            $http.get(Base_Url + "/getDishById/" + $scope.currentUserCart[i].dish )
            .then(function(response) {
              for(var i = 0; i < $scope.currentUserCart.length; i++){
                // console.log($scope.currentUserCart[i]);
                var price = response.data[0].price * $scope.currentUserCart[i].amount;
                $scope.totalPrice += Math.floor(price / $scope.currentUserCart.length);
                
              } 
              // console.log(response.data[0].price);
              $scope.cartItems.push(response.data[0]);
              localStorage.setItem("cartItems",$scope.cartItems);
              // console.log($scope.cartItems)
            });
          }
        });
        console.log($scope.user._id,cardnumber,cardname,$scope.tableNumber,
          $scope.cartItemsAmount,$scope.cartItems,$scope.totalPrice);
        var orderdata = {
          "user": $scope.user._id,
          "bankname": cardname,
          "bankcard": cardnumber.toString(),
          "table": $scope.tableNumber,
          "dish": $scope.cartItems,
          "dishamount": $scope.cartItemsAmount,
          "price": $scope.totalPrice,
          "status": 0,
        }
        $http.post(Base_Url + "/addOrder", orderdata)
          .then(function(response) {
              console.log(response);
              var alertPopup = $ionicPopup.alert({
                title: 'ICAFE',
                template: 'Order generated successfully!'
              });
              $state.go('app.order');
          });
        
      }else{
        $http.get("https://icafe-a.herokuapp.com/getAdmin/admin@admin.com")
        .then(function(response){
          console.log(response.data.table);
          $scope.tableNumber = response.data.table;
          $http.get(Base_Url + "/getTableCart/" + $scope.tableNumber)
          .then(function(response) {
            $scope.currentUserCart = response.data;
            $scope.cartItems = [];
            $scope.cartItemsAmount = [];
            $scope.cartItemsId = [];
            $scope.totalPrice = 0;
            for(var i = 0; i < $scope.currentUserCart.length; i++){
              $scope.cartItemsAmount.push($scope.currentUserCart[i].amount);
              $scope.cartItemsId.push($scope.currentUserCart[i]);
              $http.get(Base_Url + "/getDishById/" + $scope.currentUserCart[i].dish )
              .then(function(response) {
                for(var i = 0; i < $scope.currentUserCart.length; i++){
                  // console.log($scope.currentUserCart[i]);
                  var price = response.data[0].price * $scope.currentUserCart[i].amount;
                  $scope.totalPrice += Math.floor(price / $scope.currentUserCart.length);
                  
                } 
                console.log(response.data[0].price);
                $scope.cartItems.push(response.data[0]);
                console.log($scope.cartItems)
              });
            }
          });
        });
        console.log(cardnumber);
        var orderdata = {
          "bankname": cardname,
          "bankcard": cardnumber.toString(),
          "table": $scope.tableNumber,
          "dish": $scope.cartItems,
          "dishamount": $scope.cartItemsAmount,
          "price": $scope.totalPrice,
          "status": 0,
        }
        $http.post(Base_Url + "/addOrder", orderdata)
          .then(function(response) {
              console.log(response)
              var alertPopup = $ionicPopup.alert({
                title: 'ICAFE',
                template: 'Order generated successfully!'
              });
              $state.go('app.order');
          });
      } // end of if else
      
    }
})

.controller('OrderCtrl', function($scope, $state, $http, Base_Url, localStorageService, $cordovaBarcodeScanner,$ionicPopup) {
    $scope.$on('$ionicView.beforeEnter', function(){
      $scope.user = localStorageService.get('user');

      $http.get(Base_Url + "/getProcessingOrder")
        .then(function(response){
          console.log(response.data);
            if($scope.user){
              for(var i = 0; i < response.data.length; i++){
                if(response.data[i].user && response.data[i].user == $scope.user._id){
                  console.log(i);
                  if(i == 0){
                    $scope.queuenumber = i + 1;  
                  }else{
                    $scope.queuenumber = i;
                  }                     
                }
              }
            }else{
              for(var i = 0; i < response.data.length; i++){
                if(response.data[i].table && response.data[i].table == $scope.tableNumber){
                  console.log(i);
                }
              }
            }
        });

      if($scope.user){
          $http.get(Base_Url + "/getUserOrder/" + $scope.user._id)
          .then(function(response){
            if(response){
              console.log(response.data);
              var goEasy = new GoEasy({
                appkey: '1b811875-b9a6-493f-a51e-e556fdd949bc'
              });

              goEasy.publish({
                channel: 'order-transfer',
                message: JSON.stringify(response.data)
              });

              goEasy.subscribe({
                channel: 'order-status-confirm',
                onMessage: function(message){
                  console.log(message.content);
                  var alertPopup = $ionicPopup.alert({
                    title: 'icafe',
                    template: 'Order has been confirmed and under processing...!'
                  });
                  console.log(response.data._id);
                  $http.put(Base_Url + "/updateOrderStatus/" + response.data._id, 
                    { "status": 1 }).then(function(response) {
                    // console.log(response);
                  });
                  $scope.orderstatus = "Order has been confirmed and under processing...";
                }
              });

              goEasy.subscribe({
                channel: 'order-status-finish',
                onMessage: function(message){
                  console.log(message.content);
                  var alertPopup = $ionicPopup.alert({
                    title: 'icafe',
                    template: 'Your Food Is On The Way...'
                  });
                  $http.put(Base_Url + "/updateOrderStatus/" + response.data._id, 
                    { "status": 2 }).then(function(response) {
                    // console.log(response);
                  });
                  $scope.orderstatus = "Your Food Is On The Way...";
                }
              });

              
              console.log(response.data);
              $scope.showorder = true
              $scope.orderid = response.data._id;
              $scope.ordername = response.data.bankname;
              $scope.ordercreatetime = response.data.createdAt;
              $scope.ordertablenumber = response.data.table;
              $scope.orderprice = response.data.totalprice;
              $scope.orderbankcard = response.data.bankcard;
              $scope.orderdishamount = response.data.dishamount;
              $scope.orderdish = response.data.dish;
              $scope.orderstatus = "Order Being Transfered To Kitchen";

              $scope.cartItems = [];
              $scope.totalPrice = 0;
              for(var i = 0; i < $scope.orderdish.length; i++){
                $http.get(Base_Url + "/getDishById/" + $scope.orderdish[i]._id)
                .then(function(response) {
                  $scope.cartItems.push(response.data[0]);
                  console.log($scope.cartItems)
                });
              }

              $http.delete(Base_Url + '/clearUserCart/' + $scope.user._id)
              .then(function(response){             
              })
            }else{
              $scope.showorder = false;
              console.log("No order on this user name");
            }
          })
            
           $http.get(Base_Url + "/getUserHistoryOrder/" + $scope.user._id)
          .then(function(response){
            console.log(response.data);
            $scope.orderHistory = response.data;
            });
      }else{
        $http.get(Base_Url + "/getAdmin/admin@admin.com")
        .then(function(response){
          $scope.tableNumber = response.data.table;
           $http.get(Base_Url + "/getTableOrder/" + $scope.tableNumber)
          .then(function(response){
            if(response){

              var goEasy = new GoEasy({
                appkey: '1b811875-b9a6-493f-a51e-e556fdd949bc'
              });

              goEasy.publish({
                channel: 'order-transfer',
                message: JSON.stringify(response.data)
              });

              goEasy.subscribe({
                channel: 'order-status-confirm',
                onMessage: function(message){
                  console.log(message.content);
                  var alertPopup = $ionicPopup.alert({
                    title: 'icafe',
                    template: 'Order has been confirmed and under processing...!'
                  });
                  console.log(response.data._id);
                  $http.put(Base_Url + "/updateOrderStatus/" + response.data._id, 
                    { "status": 1 }).then(function(response) {
                    // console.log(response);
                  });
                  $scope.orderstatus = "Order has been confirmed and under processing...";
                }
              });

              goEasy.subscribe({
                channel: 'order-status-finish',
                onMessage: function(message){
                  console.log(message.content);
                  var alertPopup = $ionicPopup.alert({
                    title: 'icafe',
                    template: 'Your Food Is On The Way...'
                  });
                  $http.put(Base_Url + "/updateOrderStatus/" + response.data._id, 
                    { "status": 2 }).then(function(response) {
                    // console.log(response);
                  });
                  $scope.orderstatus = "Your Food Is On The Way...";
                }
              });

              $scope.showorder = true;
              console.log(response.data);
              $scope.orderid = response.data._id;
              $scope.ordername = response.data.bankname;
              $scope.ordercreatetime = response.data.createdAt;
              $scope.ordertablenumber = response.data.table;
              $scope.orderprice = response.data.totalprice;
              $scope.orderbankcard = response.data.bankcard;
              $scope.orderdishamount = response.data.dishamount;
              $scope.orderdish = response.data.dish;
              $scope.orderstatus = response.data.status;
              console.log($scope.orderdishamount,$scope.orderdish);

              $scope.cartItems = [];
              $scope.totalPrice = 0;
              for(var i = 0; i < $scope.orderdish.length; i++){
                $http.get(Base_Url + "/getDishById/" + $scope.orderdish[i]._id)
                .then(function(response) {
                  $scope.cartItems.push(response.data[0]);
                  console.log($scope.cartItems)
                });
              }

              $http.delete(Base_Url + '/clearTableCart/' + $scope.tableNumber)
              .then(function(response){             
              })
            }else{
              $scope.showorder = false;
              console.log("No order on this table");
            }            
          })
        })
         
      }     
    }); 

})
