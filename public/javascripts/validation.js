
$(document).ready(function(){
    $("#Signup").validate({
        errorClass:"valid",
     rules:{
        first_name:{
            required:true,
            minlength:4,
            maxlength:15,
            namevalidation:true
        },
        last_name:{
            required:true,
            minlength:4,
            maxlength:15,
            namevalidation:true
        },
         email:{
            required:true,
            email:true
        },
        phone:{
            required:true,
            number:true,
            minlength:10,
            maxlength:15
        },
         password:{
            required:true,
            minlength:8
        },
       cmpassword:{
           required:true,
           equalTo:'#password'
       },
       
       

       
        
     },
     messages:{
         first_name:{
             required:"Please enter your name",
             minlength:"At least 4 characters required",
             maxlength:"Maximum 15 characters are allowed"
         },
         last_name:{
            required:"Please enter your name",
            minlength:"At least 4 characters required",
            maxlength:"Maximum 15 characters are allowed"
        },
         email:{
             required:"Please enter your email id",
             email:"Enter a valid email"
         },
         
         
         phone:{
            required:"Please enter your phone number",
            minlength:"Enter 10 numbers",
            maxlength:"Number should be less than or equal to 15 numbers",
            
           },
         
         password:"Please enter your password",
         address:"please enter your address",
        
     }
    })
    $.validator.addMethod("namevalidation", function(value, element) {
            return /^[A-Za-z]+$/.test(value);
    },
      "Sorry,only alphabets are allowed"
   );
   
})

//Vendor Sign up validation//

$(document).ready(function(){
$("#vendorForm").validate({
    errorClass:"valid",
 rules:{
    name:{
        required:true,
        minlength:4,
        maxlength:15,
        namevalidation:true
    },
     email:{
        required:true,
        email:true
    },
     password:{
        required:true,
        minlength:8
    },
   cmpassword:{
       required:true,
       equalTo:'#cmpassword'
   },
   
    phone:{
        required:true,
        minlength:10,
        maxlength:15,
        number:true
    },
    location:{
        required:true,
        minlength:4,

    }
    
 },
 messages:{
     name:{
         required:"Please enter your name",
         minlength:"At least 4 characters required",
         maxlength:"Maximum 15 characters are allowed"
     },
     email:{
         required:"Please enter your email id",
         email:"Enter a valid email"
     },
     
     
     number:{
        required:"Please enter your phone number",
        minlength:"Enter 10 numbers",
        maxlength:"Number should be less than or equal to 15 numbers",
        
       },
     
     password:"Please enter your password",
    
 }
})
$.validator.addMethod("namevalidation", function(value, element) {
        return /^[A-Za-z]+$/.test(value);
},
  "Sorry,only alphabets are allowed"
);

})





//Add product validation//

$(document).ready(function(){
    $("#addproduct").validate({
        errorClass:"valid",
     rules:{
        productname:{
            required:true,
            namevalidation:true
        },
       
        brandname:{
            required:true,
        },
        color:{
            required:true,
            
        },
        price:{
            required:true,
            Number:true
        },
        oldprice:{
            required:true
        },
        description:{
            required:true
        }
        
     },


     messages:{
         productname:{
             required:"Please enter your productname",
         },
         brand:{
             required:"Please enter your brand name",
         },
         color:{
            required:"Please enter your product color"

         },
         price:{
            required:"Please enter your prroduct price"
         },
         oldprice:{
            required:"Please enter old price",
           },
        
     }
    })
    $.validator.addMethod("namevalidation", function(value, element) {
            return /^[A-Za-z]+$/.test(value);
    },
      "Sorry,only alphabets are allowed"
    );
    
    })
    
    //add brand Validation//

    $(document).ready(function(){
        $("#brand").validate({
            errorClass:"valid",
         rules:{
            brandname:{
                required:true,
                namevalidation:true
            }
            
         },
    
    
         messages:{
             brandname:{
                 required:"Please enter your brandname",
             }
            
         }
        })
        $.validator.addMethod("namevalidation", function(value, element) {
                return /^[A-Za-z]+$/.test(value);
        },
          "Sorry,only alphabets are allowed"
        );
        
        })

   

    
    

