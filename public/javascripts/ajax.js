
function addToCart(proId){
    console.log(proId);
    $.ajax({
        url:'/cart-view/'+proId,
        method:'post',
        success:(response)=>{
            if(response.error){
                
            }else if(response.msg){
                swal({
                    title: "Product Add to cart",
                    text: "Once deleted, you will not be able to recover this imaginary file",
                    icon: "success",
                    buttons: false,
                    timer:5000
                  })
                window.location.reload()
                $("#cart-count").html(response.count)
            }else{
                alert("something went wrong")
            }
        }
    })
}