using System.ComponentModel.DataAnnotations;

namespace MeuSiteEmMVC.Models
{
    public class LoginModel
    {
        [Required(ErrorMessage = "O PIN é obrigatório")]
        [Display(Name = "PIN de acesso")]
        public string Pin { get; set; }
    }
}
